import { createServerFn } from "@tanstack/react-start";
import { Chess } from "chess.js";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const token = () => crypto.randomUUID();
const clean = (s: unknown, max = 24) => String(s ?? "").slice(0, max);
const rnd = (n: number) => Array.from({ length: n }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
// Random-match games use ids starting with "~" so they never collide with friend codes.
const isMatchId = (id: string) => id.startsWith("~");

type Who = { char: string; name: string };
const who = (d: { char?: string; name?: string }): Who => ({ char: clean(d.char, 16) || "fox", name: clean(d.name, 16).trim() || "Player" });

async function newGame(id: string, w: Who) {
  const db = await admin();
  const t = token();
  const { error } = await db.from("games").insert({ id, white_name: w.name, white_char: w.char });
  if (error) throw new Error(error.message);
  await db.from("game_seats").insert({ game_id: id, color: "w", token: t });
  return { id, color: "w" as const, token: t };
}

async function seatBlack(id: string, w: Who) {
  const db = await admin();
  const t = token();
  const { error } = await db.from("game_seats").insert({ game_id: id, color: "b", token: t });
  if (error) return null;
  const { data: dup } = await db.from("game_seats").select("token").eq("game_id", id).eq("color", "b");
  if ((dup?.length ?? 0) > 1 && dup?.[0]?.token !== t) {
    await db.from("game_seats").delete().eq("game_id", id).eq("token", t);
    return null;
  }
  await db.from("games").update({ black_name: w.name, black_char: w.char, updated_at: new Date().toISOString() }).eq("id", id);
  return { id, color: "b" as const, token: t };
}

export const createGame = createServerFn({ method: "POST" })
  .inputValidator((d: { char: string; name: string }) => who(d))
  .handler(async ({ data }) => newGame(rnd(6), data));

export const joinGame = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; char: string; name: string }) => ({ id: clean(d.id, 8).toUpperCase(), w: who(d) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: g } = await db.from("games").select("id").eq("id", data.id).maybeSingle();
    if (!g) throw new Error("Game not found");
    const s = await seatBlack(data.id, data.w);
    if (!s) throw new Error("This game is already full");
    return s;
  });

/** Pair with someone else waiting, or open a new waiting game. */
export const findMatch = createServerFn({ method: "POST" })
  .inputValidator((d: { char: string; name: string; mine?: string | undefined; token?: string | undefined }) => ({ w: who(d), mine: clean(d.mine, 8), token: clean(d.token, 64) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const fresh = new Date(Date.now() - 15_000).toISOString();
    let mineCreated: string | null = null;
    if (data.mine) {
      const { data: own } = await db.from("games").select("created_at,black_name").eq("id", data.mine).maybeSingle();
      if (own?.black_name) return { id: data.mine, color: "w" as const, token: data.token, matched: true };
      if (own) {
        mineCreated = own.created_at;
        await db.from("games").update({ updated_at: new Date().toISOString() }).eq("id", data.mine);
      }
    }
    const { data: open } = await db.from("games").select("id,created_at").like("id", "~%").is("black_name", null)
      .gte("updated_at", fresh).neq("id", data.mine || "-").order("created_at").limit(5);
    for (const g of open ?? []) {
      if (mineCreated && g.created_at >= mineCreated) break; // the older waiter joins; we wait
      const s = await seatBlack(g.id, data.w);
      if (s) {
        if (data.mine && isMatchId(data.mine)) {
          await db.from("game_seats").delete().eq("game_id", data.mine);
          await db.from("games").delete().eq("id", data.mine);
        }
        return { ...s, matched: true };
      }
    }
    if (data.mine && mineCreated) return { id: data.mine, color: "w" as const, token: data.token, matched: false };
    return { ...(await newGame("~" + rnd(5), data.w)), matched: false };
  });

export const cancelMatch = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; token: string }) => ({ id: clean(d.id, 8), token: clean(d.token, 64) }))
  .handler(async ({ data }) => {
    if (!isMatchId(data.id)) return { ok: false };
    const db = await admin();
    const { data: seat } = await db.from("game_seats").select("token").eq("game_id", data.id).eq("color", "w").maybeSingle();
    const { data: g } = await db.from("games").select("black_name").eq("id", data.id).maybeSingle();
    if (seat?.token !== data.token || g?.black_name) return { ok: false };
    await db.from("game_seats").delete().eq("game_id", data.id);
    await db.from("games").delete().eq("id", data.id);
    return { ok: true };
  });

export const playMove = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; token: string; from: string; to: string }) => ({ id: clean(d.id, 8), token: clean(d.token, 64), from: clean(d.from, 2), to: clean(d.to, 2) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: g } = await db.from("games").select("fen").eq("id", data.id).maybeSingle();
    if (!g) throw new Error("Game not found");
    const chess = new Chess(g.fen);
    const { data: seat } = await db.from("game_seats").select("token").eq("game_id", data.id).eq("color", chess.turn()).maybeSingle();
    if (!seat || seat.token !== data.token) throw new Error("Not your turn");
    const m = chess.move({ from: data.from, to: data.to, promotion: "q" });
    const { error } = await db.from("games")
      .update({ fen: chess.fen(), last_from: m.from, last_to: m.to, captured: m.captured ?? null, updated_at: new Date().toISOString() })
      .eq("id", data.id).eq("fen", g.fen);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
