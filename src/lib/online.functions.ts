import { createServerFn } from "@tanstack/react-start";
import { Chess } from "chess.js";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const token = () => crypto.randomUUID();
const clean = (s: unknown, max = 24) => String(s ?? "").slice(0, max);

export const createGame = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; char: string }) => ({ name: clean(d.name) || "White", char: clean(d.char, 16) || "pip" }))
  .handler(async ({ data }) => {
    const db = await admin();
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    const t = token();
    const { error } = await db.from("games").insert({ id, white_name: data.name, white_char: data.char });
    if (error) throw new Error(error.message);
    await db.from("game_seats").insert({ game_id: id, color: "w", token: t });
    return { id, color: "w" as const, token: t };
  });

export const joinGame = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; name: string; char: string }) => ({ id: clean(d.id, 8).toUpperCase(), name: clean(d.name) || "Black", char: clean(d.char, 16) || "ember" }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: g } = await db.from("games").select("id").eq("id", data.id).maybeSingle();
    if (!g) throw new Error("Game not found");
    const { data: seat } = await db.from("game_seats").select("color").eq("game_id", data.id).eq("color", "b").maybeSingle();
    if (seat) throw new Error("This game is already full");
    const t = token();
    await db.from("game_seats").insert({ game_id: data.id, color: "b", token: t });
    await db.from("games").update({ black_name: data.name, black_char: data.char, updated_at: new Date().toISOString() }).eq("id", data.id);
    return { id: data.id, color: "b" as const, token: t };
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
