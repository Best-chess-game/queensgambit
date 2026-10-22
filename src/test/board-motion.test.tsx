import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chess } from "chess.js";
import { Board } from "@/components/chess/Board";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function trackMotion() {
  const animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }));
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    writable: true,
    value: animate,
  });
  return animate;
}
describe("Board movement", () => {
  it.each([false, true])("slides from the source square with flipped=%s", (flipped) => {
    const animate = trackMotion();
    const game = new Chess();
    const props = { game, theme: "classic", pieceSet: "classic", onMove: vi.fn(), flipped };
    const view = render(<Board {...props} fen={game.fen()} />);
    expect(animate).not.toHaveBeenCalled();
    game.move("e4");
    view.rerender(<Board {...props} fen={game.fen()} lastMove={{ from: "e2", to: "e4" }} />);
    expect(animate).toHaveBeenCalledWith(
      [
        { transform: `translate(0%, ${flipped ? -200 : 200}%)`, zIndex: 20 },
        { transform: "translate(0, 0)", zIndex: 20 },
      ],
      expect.objectContaining({ duration: 360 }),
    );
  });
  it("moves both the king and rook when castling", () => {
    const animate = trackMotion();
    const game = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const props = { game, theme: "classic", pieceSet: "classic", onMove: vi.fn() };
    const view = render(<Board {...props} fen={game.fen()} />);
    game.move("O-O");
    view.rerender(<Board {...props} fen={game.fen()} lastMove={{ from: "e1", to: "g1" }} />);
    expect(animate).toHaveBeenCalledTimes(2);
  });
  it("skips movement for reduced motion", () => {
    const animate = trackMotion();
    vi.spyOn(window, "matchMedia").mockReturnValue({ ...window.matchMedia(""), matches: true });
    const game = new Chess();
    const props = { game, theme: "classic", pieceSet: "classic", onMove: vi.fn() };
    const view = render(<Board {...props} fen={game.fen()} />);
    game.move("e4");
    view.rerender(<Board {...props} fen={game.fen()} lastMove={{ from: "e2", to: "e4" }} />);
    expect(animate).not.toHaveBeenCalled();
  });
});
