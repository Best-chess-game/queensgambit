import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chess } from "chess.js";
import { Board } from "@/components/chess/Board";

const sound = vi.hoisted(() => ({ play: vi.fn(), cancel: vi.fn() }));
vi.mock("@/components/chess/useMoveSound", () => ({ useMoveSound: () => sound }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
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
    expect(sound.play).not.toHaveBeenCalled();
    game.move("e4");
    view.rerender(<Board {...props} fen={game.fen()} lastMove={{ from: "e2", to: "e4" }} />);
    expect(sound.play).toHaveBeenCalledExactlyOnceWith(360, false);
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
    expect(sound.play).toHaveBeenCalledExactlyOnceWith(360, false);
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
    expect(sound.play).toHaveBeenCalledExactlyOnceWith(0, false);
  });
  it.each([
    ["q", true],
    ["r", false],
  ] as const)("uses the special sound only when capturing a queen (%s)", (piece, special) => {
    const game = new Chess(`${piece}6k/8/8/8/8/8/8/R6K w - - 0 1`);
    const props = { game, theme: "classic", pieceSet: "classic", onMove: vi.fn() };
    const view = render(<Board {...props} fen={game.fen()} />);
    game.move({ from: "a1", to: "a8" });
    view.rerender(<Board {...props} fen={game.fen()} lastMove={{ from: "a1", to: "a8" }} />);
    expect(sound.play).toHaveBeenCalledExactlyOnceWith(360, special);
    view.rerender(<Board {...props} fen={game.fen()} lastMove={{ from: "a1", to: "a8" }} />);
    expect(sound.play).toHaveBeenCalledTimes(1);
  });
});
