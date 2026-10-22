import type { Chess } from "chess.js";

export const PROMOTIONS = ["q", "r", "b", "n"] as const;
export type Promotion = (typeof PROMOTIONS)[number];
export function promotion(value: unknown): Promotion {
  if (!PROMOTIONS.includes(value as Promotion))
    throw new Error("Choose a queen, rook, bishop or knight.");
  return value as Promotion;
}
export function resultText(game: Chess, names: { w: string; b: string }) {
  if (game.isCheckmate())
    return `Checkmate — ${names[game.turn() === "w" ? "b" : "w"]} wins. ${names[game.turn()]} was checkmated.`;
  return game.isDraw() ? "Draw — game over." : null;
}
