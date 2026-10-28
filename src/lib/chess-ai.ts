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
export function pickBotMove(fen: string, difficulty = "medium"): Move {
  if (difficulty === "easy") {
    const g0 = new Chess(fen);
    const ms = g0.moves({ verbose: true });
    const caps = ms.filter((m) => m.captured);
    return (Math.random() < 0.35 && caps.length ? caps : ms)[Math.floor(Math.random() * (Math.random() < 0.35 && caps.length ? caps.length : ms.length))] ?? ms[0]!;
  }
  if (difficulty === "hard") return searchMove(fen);
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

const PST_CENTER = (sq: string) => { const f = sq.charCodeAt(0) - 97, r = +sq[1]! - 1; return 0.1 * (3.5 - Math.max(Math.abs(3.5 - f), Math.abs(3.5 - r))); };
function evalFor(g: Chess, me: "w" | "b") {
  if (g.isCheckmate()) return g.turn() === me ? -1000 : 1000;
  if (g.isDraw()) return 0;
  let s = 0;
  g.board().forEach((row) => row.forEach((c) => { if (c) { const v = (VALUE[c.type] ?? 0) + (c.type !== "k" ? PST_CENTER(c.square) : 0); s += c.color === me ? v : -v; } }));
  return s;
}
function ab(g: Chess, depth: number, a: number, b: number, me: "w" | "b"): number {
  if (depth === 0 || g.isGameOver()) return evalFor(g, me);
  const moves = g.moves({ verbose: true }).sort((x, y) => (y.captured ? 1 : 0) - (x.captured ? 1 : 0));
  const max = g.turn() === me;
  let best = max ? -Infinity : Infinity;
  for (const m of moves) {
    g.move(m); const v = ab(g, depth - 1, a, b, me); g.undo();
    if (max) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); b = Math.min(b, v); }
    if (b <= a) break;
  }
  return best;
}
/** Hard: 3-ply alpha-beta search. */
function searchMove(fen: string): Move {
  const g = new Chess(fen); const me = g.turn();
  let best: Move | null = null, bestV = -Infinity;
  for (const m of g.moves({ verbose: true })) {
    g.move(m); const v = ab(g, 2, -Infinity, Infinity, me) + Math.random() * 0.05; g.undo();
    if (v > bestV) { bestV = v; best = m; }
  }
  return best!;
}
