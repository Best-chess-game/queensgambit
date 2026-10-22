import { BoardPiece } from "./PieceBody";
import { useState } from "react";
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
  onMove: (from: Square, to: Square) => void;
}) {
  void fen;
  const [sel, setSel] = useState<Square | null>(null);
  const targets = sel ? game.moves({ square: sel, verbose: true }).map((m) => m.to) : [];
  const board = game.board();
  const rows = flipped ? [...board].reverse().map((r) => [...r].reverse()) : board;
  const inCheck = game.inCheck() ? game.turn() : null;

  const click = (sq: Square) => {
    if (disabled) return;
    if (sel && targets.includes(sq)) {
      onMove(sel, sq);
      setSel(null);
      return;
    }
    const p = game.get(sq);
    setSel(p && p.color === game.turn() ? sq : null);
  };

  return (
    <div
      className={`theme-${theme} set-${pieceSet} rounded-2xl p-2 bg-card shadow-[0_8px_0_var(--border)] w-full max-w-[min(92vw,600px)]`}
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
                    key={lastMove?.to === sq ? fen : undefined}
                    className={`absolute inset-0 grid place-items-center ${lastMove?.to === sq ? "anim-pop" : ""} ${sel === sq ? "scale-110 -translate-y-1" : ""} transition-transform`}
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
    </div>
  );
}
