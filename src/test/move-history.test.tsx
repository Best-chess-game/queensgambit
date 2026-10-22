import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { BoardWithHistory } from "@/components/chess/MoveHistory";
import { gameWithHistory } from "@/lib/game-history";

afterEach(cleanup);
describe("Move history", () => {
  it("groups moves by turn and clears after a new game", () => {
    const game = new Chess();
    for (const move of ["e4", "e5", "Nf3"]) game.move(move);
    const view = render(<BoardWithHistory game={game}>Board</BoardWithHistory>);
    expect(screen.getByRole("row", { name: "1. e4 e5" })).toBeTruthy();
    expect(screen.getByRole("row", { name: "2. Nf3 —" })).toBeTruthy();
    game.reset();
    view.rerender(<BoardWithHistory game={game}>Board</BoardWithHistory>);
    expect(screen.getByText("No moves yet.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
  it("keeps complete notation and repetition state after reconnecting", () => {
    const game = new Chess();
    for (const move of ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"]) game.move(move);
    const restored = gameWithHistory(game.fen(), game.pgn());
    expect(restored.history()).toEqual(game.history());
    expect(restored.isThreefoldRepetition()).toBe(true);
  });
  it("shows correct numbering when an older game starts recording with Black to move", () => {
    const game = new Chess("r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 12");
    game.move("O-O");
    const restored = gameWithHistory(game.fen(), game.pgn());
    render(<BoardWithHistory game={restored}>Board</BoardWithHistory>);
    expect(screen.getByRole("row", { name: "12. — O-O" })).toBeTruthy();
    expect(screen.getByText("Earlier moves weren’t recorded.")).toBeTruthy();
  });
  it("rejects notation that disagrees with the saved board", () => {
    const game = new Chess();
    game.move("e4");
    expect(() => gameWithHistory(new Chess().fen(), game.pgn())).toThrow("does not match");
  });
});
