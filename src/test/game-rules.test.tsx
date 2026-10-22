import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chess } from "chess.js";
import { Board } from "@/components/chess/Board";
import { Comments } from "@/components/chess/Comments";
import { cleanComment, playerName } from "@/lib/comments";
import { PROMOTIONS, promotion, resultText } from "@/lib/game-rules";

afterEach(cleanup);
describe("Promotion", () => {
  it.each(PROMOTIONS)("lets a pawn promote to %s", (piece) => {
    const game = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
    const onMove = vi.fn((from, to, choice) => {
      game.move({ from, to, promotion: choice });
    });
    render(
      <Board game={game} fen={game.fen()} theme="classic" pieceSet="classic" onMove={onMove} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "a7" }));
    fireEvent.click(screen.getByRole("button", { name: "a8" }));
    expect(onMove).not.toHaveBeenCalled();
    const label = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" }[piece];
    fireEvent.click(screen.getByRole("button", { name: `Promote to ${label}` }));
    expect(game.get("a8")?.type).toBe(piece);
  });
  it("rejects invalid promotion values", () => {
    expect(() => promotion("k")).toThrow();
  });
});
describe("Shared results", () => {
  it("shows the same winner and loser from either player's FEN", () => {
    const game = new Chess();
    for (const move of ["f3", "e5", "g4", "Qh4#"]) game.move(move);
    const result = resultText(game, { w: "Alice", b: "Bob" });
    expect(result).toBe("Checkmate — Bob wins. Alice was checkmated.");
    expect(resultText(new Chess(game.fen()), { w: "Alice", b: "Bob" })).toBe(result);
  });
});
describe("Names and comments", () => {
  it.each(["", "   ", "x".repeat(25)])("requires a valid player name", (name) => {
    expect(() => playerName(name)).toThrow();
  });
  it.each(["shit", "f.u.c.k", "sh1t", "b!tch", "fuck you"])("rejects profanity: %s", (text) => {
    expect(() => cleanComment(text)).toThrow();
  });
  it("allows friendly comments and innocent substrings", () => {
    expect(cleanComment(" Nice move, classic bishop! ")).toBe("Nice move, classic bishop!");
  });
  it("does not send a rejected comment", () => {
    const send = vi.fn();
    render(<Comments messages={[]} names={["Alice"]} onSend={send} />);
    fireEvent.change(screen.getByLabelText("Write a comment"), { target: { value: "shit" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(send).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("without swear words");
  });
});
