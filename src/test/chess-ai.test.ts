import { afterEach, describe, expect, it, vi } from "vitest";
import { Chess } from "chess.js";
import { DIFFICULTIES, pickBotMove } from "@/lib/chess-ai";

afterEach(() => vi.restoreAllMocks());
describe("Computer difficulty", () => {
  it.each(DIFFICULTIES)("returns a legal opening move on %s", (level) => {
    const game = new Chess();
    const move = pickBotMove(game.fen(), level);
    expect(() => game.move(move)).not.toThrow();
  });
  it("uses random legal moves on easy", () => {
    const game = new Chess();
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(pickBotMove(game.fen(), "easy").lan).toBe(game.moves({ verbose: true })[0]?.lan);
  });
  it.each(["medium", "hard"] as const)("finds checkmate on %s", (level) => {
    const game = new Chess();
    for (const move of ["f3", "e5", "g4"]) game.move(move);
    game.move(pickBotMove(game.fen(), level));
    expect(game.isCheckmate()).toBe(true);
  });
  it("hard avoids a defended pawn that would lose its queen", () => {
    const game = new Chess("3r2k1/8/8/3p4/8/8/8/3Q2K1 w - - 0 1");
    const move = pickBotMove(game.fen(), "hard");
    expect(move.lan).not.toBe("d1d5");
    expect(() => game.move(move)).not.toThrow();
  });
  it("rejects positions without legal moves", () => {
    expect(() => pickBotMove("7k/6Q1/6K1/8/8/8/8/8 b - - 0 1", "hard")).toThrow("No legal moves");
  });
});
