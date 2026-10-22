import { useEffect, useRef, type ReactNode } from "react";
import { Chess } from "chess.js";

export function BoardWithHistory({ game, children }: { game: Chess; children: ReactNode }) {
  const moves = game.history({ verbose: true });
  const turns = new Map<number, { w?: string; b?: string }>();
  for (const move of moves) {
    const number = Number(move.before.split(" ")[5]);
    const turn = turns.get(number) ?? {};
    turn[move.color] = move.san;
    turns.set(number, turn);
  }
  const scroll = useRef<HTMLDivElement>(null);
  const last = moves.at(-1)?.after;
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [last]);
  const earlierMissing = (moves[0]?.before ?? game.fen()) !== new Chess().fen();
  return (
    <div className="relative w-full max-w-[600px] flex flex-col gap-4">
      {children}
      <aside
        aria-label="Move history"
        className="w-full rounded-2xl border-2 border-border bg-card p-3 min-[900px]:absolute min-[900px]:left-[calc(100%+1rem)] min-[900px]:top-0 min-[900px]:w-[220px]"
      >
        <h2 className="font-display font-bold text-lg mb-2">Moves</h2>
        {earlierMissing && (
          <p className="text-sm text-muted-foreground mb-2">Earlier moves weren’t recorded.</p>
        )}
        {moves.length === 0 ? (
          <p className="text-sm text-muted-foreground">No moves yet.</p>
        ) : (
          <div
            ref={scroll}
            className="max-h-48 min-[900px]:max-h-[480px] overflow-y-auto [scrollbar-gutter:stable]"
          >
            <table className="w-full text-left text-sm tabular-nums">
              <thead className="sticky top-0 bg-card">
                <tr>
                  <th scope="col" className="py-2 pr-2">
                    <span className="sr-only">Turn</span>
                  </th>
                  <th scope="col" className="py-2">
                    White
                  </th>
                  <th scope="col" className="py-2">
                    Black
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...turns].map(([number, turn], index) => (
                  <tr key={number} className={index === turns.size - 1 ? "bg-primary/10" : ""}>
                    <th scope="row" className="px-2 py-2 font-normal text-muted-foreground">
                      {number}.
                    </th>
                    <td className="px-1 py-2 font-semibold">{turn.w ?? "—"}</td>
                    <td className="px-1 py-2 font-semibold">{turn.b ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </aside>
    </div>
  );
}
