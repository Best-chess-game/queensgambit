import { type Promotion } from "@/lib/game-rules";
import { BoardPiece } from "./PieceBody";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Chess, Square } from "chess.js";

const LETTER: Record<string, string> = { k: "K", q: "Q", r: "R", b: "B", n: "N", p: "" };
const FILES = "abcdefgh";

export function Board({
  game,
  fen,
  theme,
  pieceSet,
  flipped,
  disabled,
  lastMove,
  captureSq,
  onMove,
}: {
  game: Chess;
  fen: string;
  theme: string;
  pieceSet: string;
  flipped?: boolean;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  captureSq?: string | null;
  onMove: (from: Square, to: Square, promotion?: Promotion) => void;
}) {
  const pieceElements = useRef(new Map<string, HTMLSpanElement>());
  const previousFen = useRef(fen);
  const appearance = `${flipped}-${theme}-${pieceSet}`;
  const previousAppearance = useRef(appearance);
  const flights = useRef(new Map<string, { animation: Animation; dx: number; dy: number }>());
  useLayoutEffect(() => {
    const before = previousFen.current;
    previousFen.current = fen;
    if (previousAppearance.current !== appearance) {
      previousAppearance.current = appearance;
      flights.current.forEach(({ animation }) => animation.cancel());
      flights.current.clear();
      return;
    }
    if (before === fen) return;
    const oldFlights = new Map(flights.current);
    flights.current.clear();
    const replaced = new Set<string>();
    let realMove = false;
    const animate = (from: string, to: string) => {
      replaced.add(from);
      replaced.add(to);
      const element = pieceElements.current.get(to);
      if (!element || !element.animate) return;
      const direction = flipped ? -1 : 1;
      let dx = (from.charCodeAt(0) - to.charCodeAt(0)) * direction * 100;
      let dy = (Number(to[1]) - Number(from[1])) * direction * 100;
      const ongoing = oldFlights.get(from);
      if (ongoing) {
        const progress = Number(ongoing.animation.effect?.getComputedTiming().progress ?? 1);
        dx += ongoing.dx * (1 - progress);
        dy += ongoing.dy * (1 - progress);
      }
      const animation = element.animate(
        [
          { transform: `translate(${dx}%, ${dy}%)`, zIndex: 20 },
          { transform: "translate(0, 0)", zIndex: 20 },
        ],
        { duration: 360, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      );
      flights.current.set(to, { animation, dx, dy });
      animation.onfinish = () => {
        if (flights.current.get(to)?.animation === animation) flights.current.delete(to);
      };
    };
    if (lastMove && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Animate only a real move, never a reset or a freshly loaded online board.
      const placement = before.split(" ")[0] ?? "";
      const oldSquares = new Map<string, string>();
      placement.split("/").forEach((row, index) => {
        let file = 0;
        for (const symbol of row) {
          if (/\d/.test(symbol)) file += Number(symbol);
          else {
            oldSquares.set(`${FILES[file]}${8 - index}`, symbol);
            file++;
          }
        }
      });
      const source = oldSquares.get(lastMove.from);
      const moved = game.get(lastMove.to as Square);
      if (
        source &&
        moved &&
        !game.get(lastMove.from as Square) &&
        (source === source.toUpperCase()) === (moved.color === "w")
      ) {
        realMove = true;
        animate(lastMove.from, lastMove.to);
        if (
          source.toLowerCase() === "k" &&
          Math.abs(lastMove.from.charCodeAt(0) - lastMove.to.charCodeAt(0)) === 2
        ) {
          const rank = lastMove.to[1];
          const kingSide = lastMove.to[0] === "g";
          animate(`${kingSide ? "h" : "a"}${rank}`, `${kingSide ? "f" : "d"}${rank}`);
        }
      }
    }
    oldFlights.forEach((flight, square) => {
      if (realMove && !replaced.has(square) && game.get(square as Square))
        flights.current.set(square, flight);
      else flight.animation.cancel();
    });
  }, [fen, flipped, game, lastMove, appearance]);
  useEffect(
    () => () => {
      flights.current.forEach(({ animation }) => animation.cancel());
    },
    [],
  );
  const [pending, setPending] = useState<{ from: Square; to: Square; fen: string } | null>(null);
  const picker = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (pending) picker.current?.focus();
  }, [pending]);
  const [sel, setSel] = useState<Square | null>(null);
  const targets = sel ? game.moves({ square: sel, verbose: true }).map((m) => m.to) : [];
  const board = game.board();
  const rows = flipped ? [...board].reverse().map((r) => [...r].reverse()) : board;
  const inCheck = game.inCheck() ? game.turn() : null;

  const click = (sq: Square) => {
    if (disabled || pending?.fen === fen) return;
    if (sel && targets.includes(sq)) {
      if (game.moves({ square: sel, verbose: true }).some((m) => m.to === sq && m.promotion)) {
        setPending({ from: sel, to: sq, fen });
      } else onMove(sel, sq);
      setSel(null);
      return;
    }
    const p = game.get(sq);
    setSel(p && p.color === game.turn() && sel !== sq ? sq : null);
  };

  return (
    <div
      className={`relative theme-${theme} set-${pieceSet} rounded-2xl p-2 bg-card shadow-[0_8px_0_var(--border)] w-full max-w-[min(92vw,600px)]`}
    >
      <div className="grid grid-cols-8 aspect-square overflow-hidden rounded-xl">
        {rows.flatMap((row, ri) =>
          row.map((cell, ci) => {
            const file = flipped ? 7 - ci : ci;
            const rank = flipped ? ri + 1 : 8 - ri;
            const sq = `${FILES[file]}${rank}` as Square;
            const light = (file + rank) % 2 === 0;
            const isTarget = targets.includes(sq);
            const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const isKingCheck = cell?.type === "k" && cell.color === inCheck;
            return (
              <button
                key={sq}
                onClick={() => click(sq)}
                className={`relative ${light ? "sq-light bg-sq-light" : "sq-dark bg-sq-dark"} [container-type:size]`}
                aria-label={sq}
              >
                {(isLast || sel === sq) && <span className="absolute inset-0 bg-sq-highlight" />}
                {isKingCheck && (
                  <span className="absolute inset-0 bg-destructive/60 animate-pulse" />
                )}
                {captureSq === sq && (
                  <span
                    key={fen}
                    className="absolute inset-2 rounded-full border-4 border-accent anim-burst"
                  />
                )}
                {cell && (
                  <span
                    ref={(element) => {
                      if (element) pieceElements.current.set(sq, element);
                      else pieceElements.current.delete(sq);
                    }}
                    className={`absolute inset-0 grid place-items-center ${sel === sq ? "scale-110 -translate-y-1" : ""} transition-transform`}
                    style={{ fontSize: "80cqh" }}
                  >
                    {pieceSet !== "letters" ? (
                      <BoardPiece type={cell.type} color={cell.color} />
                    ) : (
                      <span className={`piece piece-${cell.color}`}>
                        {LETTER[cell.type] || "•"}
                      </span>
                    )}
                  </span>
                )}
                {isTarget && (
                  <span
                    className={`absolute ${cell ? "inset-1 rounded-full border-4 border-primary/70" : "left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/70"}`}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
      {pending && pending.fen === fen && !disabled && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose promotion"
          onKeyDown={(e) => {
            if (e.key === "Escape") setPending(null);
            if (e.key === "Tab") {
              const buttons = Array.from(e.currentTarget.querySelectorAll("button"));
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              e.preventDefault();
              buttons[(index + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus();
            }
          }}
          className="absolute inset-0 z-10 rounded-2xl bg-background/95 flex flex-col justify-center items-center gap-4 p-4"
        >
          <h2 className="font-bold text-xl">Choose promotion</h2>
          <div className="flex gap-2">
            {(
              [
                ["q", "Queen"],
                ["r", "Rook"],
                ["b", "Bishop"],
                ["n", "Knight"],
              ] as const
            ).map(([type, label], i) => (
              <button
                ref={i === 0 ? picker : undefined}
                key={type}
                aria-label={`Promote to ${label}`}
                className="w-16 h-24 flex flex-col items-center rounded-xl border-2 border-border bg-card p-1 focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => {
                  onMove(pending.from, pending.to, type);
                  setPending(null);
                  setSel(null);
                }}
              >
                <BoardPiece type={type} color={game.turn()} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setPending(null)} className="font-bold">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
