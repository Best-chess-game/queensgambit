import { playerColor } from "./game-players";
import type { Color } from "chess.js";
import { gameWithHistory } from "./game-history";
import { cleanComment, playerName } from "./comments";
import { promotion, type Promotion } from "./game-rules";
import { createServerFn } from "@tanstack/react-start";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const token = () => crypto.randomUUID();
const clean = (s: unknown, max = 24) => String(s ?? "").slice(0, max);

export const createGame = createServerFn({ method: "POST" })
  .validator((d: { name: string; char: string; color?: Color }) => ({
    color: playerColor(d.color ?? "w"),
    name: playerName(d.name),
    char: clean(d.char, 16) || "pip",
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    const t = token();
    const { error } = await db.from("games").insert({
      id,
      ...(data.color === "w"
        ? { white_name: data.name, white_char: data.char }
        : { white_name: "", black_name: data.name, black_char: data.char }),
    });
    if (error) throw new Error(error.message);
    const { error: seatError } = await db
      .from("game_seats")
      .insert({ game_id: id, color: data.color, token: t });
    if (seatError) throw new Error(seatError.message);
    return { id, color: data.color, token: t };
  });

export const joinGame = createServerFn({ method: "POST" })
  .validator((d: { id: string; name: string; char: string; color?: Color }) => ({
    id: clean(d.id, 8).toUpperCase(),
    color: playerColor(d.color ?? "b"),
    name: playerName(d.name),
    char: clean(d.char, 16) || "ember",
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: g } = await db.from("games").select("id").eq("id", data.id).maybeSingle();
    if (!g) throw new Error("Game not found");
    const { data: seat } = await db
      .from("game_seats")
      .select("color")
      .eq("game_id", data.id)
      .eq("color", data.color)
      .maybeSingle();
    if (seat)
      throw new Error(
        `${data.color === "w" ? "White" : "Black"} is already taken. Choose ${data.color === "w" ? "Black" : "White"}.`,
      );
    const t = token();
    const { error: seatError } = await db
      .from("game_seats")
      .insert({ game_id: data.id, color: data.color, token: t });
    if (seatError) throw new Error("That color is already taken. Choose the other color.");
    const { error: joinError } = await db
      .from("games")
      .update({
        ...(data.color === "w"
          ? { white_name: data.name, white_char: data.char }
          : { black_name: data.name, black_char: data.char }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (joinError) {
      await db.from("game_seats").delete().eq("game_id", data.id).eq("token", t);
      throw new Error(joinError.message);
    }
    return { id: data.id, color: data.color, token: t };
  });

export const playMove = createServerFn({ method: "POST" })
  .validator(
    (d: { id: string; token: string; from: string; to: string; promotion?: Promotion }) => ({
      id: clean(d.id, 8),
      token: clean(d.token, 64),
      from: clean(d.from, 2),
      to: clean(d.to, 2),
      promotion: promotion(d.promotion ?? "q"),
    }),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: g } = await db
      .from("games")
      .select("fen, pgn, white_name, black_name")
      .eq("id", data.id)
      .maybeSingle();
    if (!g) throw new Error("Game not found");
    if (!g.white_name || !g.black_name) throw new Error("Wait for your opponent to join.");
    const chess = gameWithHistory(g.fen, g.pgn);
    if (chess.isGameOver()) throw new Error("This game is over.");
    const { data: seat } = await db
      .from("game_seats")
      .select("token")
      .eq("game_id", data.id)
      .eq("color", chess.turn())
      .maybeSingle();
    if (!seat || seat.token !== data.token) throw new Error("Not your turn");
    const m = chess.move({ from: data.from, to: data.to, promotion: data.promotion });
    const { data: updated, error } = await db
      .from("games")
      .update({
        fen: chess.fen(),
        pgn: chess.pgn(),
        last_from: m.from,
        last_to: m.to,
        captured: m.captured ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("fen", g.fen)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("The board changed. Please try your move again.");
    return { ok: true };
  });

export const sendComment = createServerFn({ method: "POST" })
  .validator((d: { id: string; token: string; text: string }) => ({
    id: clean(d.id, 8),
    token: clean(d.token, 64),
    text: cleanComment(d.text),
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: seat } = await db
      .from("game_seats")
      .select("color")
      .eq("game_id", data.id)
      .eq("token", data.token)
      .maybeSingle();
    if (!seat) throw new Error("Join this game before commenting.");
    const { data: game } = await db
      .from("games")
      .select("white_name, black_name")
      .eq("id", data.id)
      .single();
    if (!game) throw new Error("Game not found.");
    const message = {
      id: crypto.randomUUID(),
      name: seat.color === "w" ? game.white_name : (game.black_name ?? "Black"),
      text: data.text,
    };
    const channel = db.channel(`comments-${data.id}`);
    try {
      const status = await channel.send({ type: "broadcast", event: "comment", payload: message });
      if (status !== "ok") throw new Error("Comment could not be sent. Try again.");
    } finally {
      await db.removeChannel(channel);
    }
    return message;
  });
