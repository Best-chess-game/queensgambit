import type { Color } from "chess.js";

export function playerColor(value: unknown): Color {
  if (value !== "w" && value !== "b") throw new Error("Choose White or Black.");
  return value;
}
export function playerNames(first: string, second: string, color: Color) {
  return color === "w" ? { w: first, b: second } : { w: second, b: first };
}
