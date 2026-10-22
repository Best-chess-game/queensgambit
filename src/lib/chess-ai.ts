import { Chess, type Move } from "chess.js";

export const VALUE: Record<string, number> & { [k: string]: number } = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function material(game: Chess) {
  let w = 0,
    b = 0;
  for (const row of game.board())
    for (const c of row)
      if (c?.color === "w") w += VALUE[c.type] ?? 0;
      else if (c) b += VALUE[c.type] ?? 0;
  return { w, b };
}

/** Is the piece that just moved to `to` now capturable by the opponent for profit? */
export function isHanging(game: Chess, to: string) {
  const piece = game.get(to as never);
  if (!piece) return false;
  const attackers = game.moves({ verbose: true }).filter((m) => m.to === to);
  if (!attackers.length) return false;
  const cheapest = Math.min(...attackers.map((m) => VALUE[m.piece] ?? 0));
  return (VALUE[piece.type] ?? 0) >= 3 && cheapest < (VALUE[piece.type] ?? 0);
}

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Easy plays randomly; medium considers captures and the opponent's reply. */
export function pickBotMove(fen: string, difficulty: Difficulty = "medium"): Move {
  const g = new Chess(fen);
  const moves = g.moves({ verbose: true });
  if (!moves.length) throw new Error("No legal moves remain.");
  if (difficulty === "easy") return moves[Math.floor(Math.random() * moves.length)]!;
  if (difficulty === "hard") return searchMove(g);
  let best = moves[0]!,
    bestScore = -Infinity;
  for (const m of moves) {
    g.move(m);
    let score = m.captured ? (VALUE[m.captured] ?? 0) * 10 : 0;
    if (g.isCheckmate()) score += 1000;
    if (g.inCheck()) score += 2;
    const replies = g.moves({ verbose: true });
    const worst = Math.max(
      0,
      ...replies.map((r) => (r.captured ? (VALUE[r.captured] ?? 0) * 10 : 0)),
    );
    score -= worst * 0.9;
    score += Math.random() * 3;
    g.undo();
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

/** Bounded iterative deepening: finish a shallow search before trying a deeper one. */
function searchMove(game: Chess): Move {
  const deadline = Date.now() + 350;
  let nodes = 0;
  const limit = Symbol("search limit");
  const ordered = () =>
    game
      .moves({ verbose: true })
      .sort(
        (a, b) =>
          (VALUE[b.captured ?? ""] ?? 0) * 10 +
          (b.promotion ? 9 : 0) -
          ((VALUE[a.captured ?? ""] ?? 0) * 10 + (a.promotion ? 9 : 0)),
      );
  const evaluate = () => {
    let score = 0;
    for (const row of game.board())
      for (const piece of row) {
        if (!piece) continue;
        const file = piece.square.charCodeAt(0) - 97;
        const rank = Number(piece.square[1]) - 1;
        const center = 3.5 - (Math.abs(3.5 - file) + Math.abs(3.5 - rank)) / 2;
        const position =
          piece.type === "n" || piece.type === "b"
            ? center * 12
            : piece.type === "p"
              ? (piece.color === "w" ? rank : 7 - rank) * 5
              : 0;
        score += ((VALUE[piece.type] ?? 0) * 100 + position) * (piece.color === "w" ? 1 : -1);
      }
    return score * (game.turn() === "w" ? 1 : -1);
  };
  const search = (depth: number, alpha: number, beta: number, ply: number): number => {
    if (++nodes > 6000 || Date.now() >= deadline) throw limit;
    if (game.isCheckmate()) return -100000 + ply;
    if (game.isDraw()) return 0;
    if (depth === 0) return evaluate();
    for (const move of ordered()) {
      game.move(move);
      let score: number;
      try {
        score = -search(depth - 1, -beta, -alpha, ply + 1);
      } finally {
        game.undo();
      }
      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }
    return alpha;
  };
  const moves = ordered();
  let best = moves[0]!;
  for (let depth = 1; depth <= 3; depth++) {
    let candidate = best;
    let alpha = -Infinity;
    try {
      for (const move of [best, ...moves.filter((move) => move.lan !== best.lan)]) {
        game.move(move);
        let score: number;
        try {
          score = -search(depth - 1, -Infinity, -alpha, 1);
        } finally {
          game.undo();
        }
        if (score > alpha) {
          alpha = score;
          candidate = move;
        }
      }
      best = candidate;
      if (alpha >= 99990) break;
    } catch (error) {
      if (error !== limit) throw error;
      break;
    }
  }
  return best;
}
