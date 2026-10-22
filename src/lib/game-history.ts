import { Chess } from "chess.js";

export function gameWithHistory(fen: string, pgn?: string | null) {
  if (!pgn) return new Chess(fen);
  const game = new Chess();
  game.loadPgn(pgn);
  if (game.fen() !== fen) throw new Error("Game history does not match the board.");
  return game;
}
