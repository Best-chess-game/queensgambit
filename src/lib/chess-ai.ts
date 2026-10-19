import { Chess, type Move } from "chess.js";

export const VALUE: Record<string, number> & { [k: string]: number } = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function material(game: Chess) {
  let w = 0, b = 0;
  for (const row of game.board()) for (const c of row) if (c) c.color === "w" ? (w += (VALUE[c.type] ?? 0)) : (b += (VALUE[c.type] ?? 0));
  return { w, b };
}

/** Is the piece that just moved to `to` now capturable by the opponent for profit? */
export function isHanging(game: Chess, to: string) {
  const piece = game.get(to as never);
  if (!piece) return false;
  const attackers = game.moves({ verbose: true }).filter((m) => m.to === to);
  if (!attackers.length) return false;
  const cheapest = Math.min(...attackers.map((m) => (VALUE[m.piece] ?? 0)));
  return (VALUE[piece.type] ?? 0) >= 3 && cheapest < (VALUE[piece.type] ?? 0);
}

/** Simple 1-ply-plus bot: grabs material, avoids hanging pieces. */
export function pickBotMove(fen: string): Move {
  const g = new Chess(fen);
  const moves = g.moves({ verbose: true });
  let best = moves[0]!, bestScore = -Infinity;
  for (const m of moves) {
    g.move(m);
    let score = m.captured ? (VALUE[m.captured] ?? 0) * 10 : 0;
    if (g.isCheckmate()) score += 1000;
    if (g.inCheck()) score += 2;
    const replies = g.moves({ verbose: true });
    const worst = Math.max(0, ...replies.map((r) => (r.captured ? (VALUE[r.captured] ?? 0) * 10 : 0)));
    score -= worst * 0.9;
    score += Math.random() * 3;
    g.undo();
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}
