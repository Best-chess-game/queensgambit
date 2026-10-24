import { createFileRoute, Link } from "@tanstack/react-router";
import { BOARD_THEMES, CHARACTERS, LOOK_PARTS, PIECE_SETS, setLookPart, useSettings } from "@/lib/chess-settings";
import { Character } from "@/components/chess/Character";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Chess Buddies" },
      { name: "description", content: "Pick your board theme, piece style and character." },
      { property: "og:title", content: "Settings — Chess Buddies" },
      { property: "og:description", content: "Customise boards, pieces and characters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const MINI = ["♜", "♞", "♝", "♛"];

function SettingsPage() {
  const [s, update] = useSettings();
  const card = (on: boolean) => `rounded-2xl border-2 p-3 bg-card transition-transform hover:-translate-y-0.5 ${on ? "border-primary shadow-[0_4px_0_var(--primary-shade)]" : "border-border shadow-[0_4px_0_var(--border)]"}`;

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Settings</h1>
        <Link to="/" className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]">Play</Link>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-3">Board theme</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BOARD_THEMES.map((t) => (
            <button key={t.id} onClick={() => update({ theme: t.id })} className={card(s.theme === t.id)}>
              <div className={`theme-${t.id} grid grid-cols-4 aspect-square rounded-lg overflow-hidden`}>
                {Array.from({ length: 16 }).map((_, i) => {
                  const light = (Math.floor(i / 4) + i) % 2 === 0;
                  return <span key={i} className={light ? "sq-light bg-sq-light" : "sq-dark bg-sq-dark"} />;
                })}
              </div>
              <div className="mt-2 font-display font-bold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Pieces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PIECE_SETS.map((p) => (
            <button key={p.id} onClick={() => update({ pieceSet: p.id })} className={card(s.pieceSet === p.id)}>
              <div className={`theme-${s.theme} set-${p.id} grid grid-cols-2 rounded-lg overflow-hidden`}>
                {MINI.map((g, i) => (
                  <span key={i} className={`${i % 3 === 0 ? "sq-light bg-sq-light" : "sq-dark bg-sq-dark"} aspect-square grid place-items-center text-4xl`}>
                    <span className={`piece piece-${i < 2 ? "w" : "b"}`}>{p.id === "letters" ? ["R", "N", "B", "Q"][i] : g}</span>
                  </span>
                ))}
              </div>
              <div className="mt-2 font-display font-bold">{p.name}</div>
            </button>
          ))}
        </div>
      </section>

      {(["w", "b"] as const).map((side) => {
        const look = side === "w" ? s.whiteLook : s.blackLook;
        const setLook = (i: number, v: number) =>
          update(side === "w" ? { whiteLook: setLookPart(look, i, v) } : { blackLook: setLookPart(look, i, v) });
        return (
          <section key={side}>
            <h2 className="text-2xl font-bold mb-3">{side === "w" ? "White" : "Black"} player</h2>
            <input
              value={side === "w" ? s.whiteName : s.blackName}
              onChange={(e) => update(side === "w" ? { whiteName: e.target.value } : { blackName: e.target.value })}
              className="mb-3 w-full max-w-xs rounded-xl border-2 border-input bg-card px-3 py-2 font-semibold"
            />
            <div className="grid grid-cols-4 gap-3">
              {CHARACTERS.map((c) => {
                const on = (side === "w" ? s.whiteChar : s.blackChar) === c.id;
                return (
                  <button key={c.id} onClick={() => update(side === "w" ? { whiteChar: c.id } : { blackChar: c.id })} className={`${card(on)} flex flex-col items-center`}>
                    <Character id={c.id} mood={on ? "happy" : "neutral"} size={64} look={on ? look : ""} />
                    <div className="font-display font-bold">{c.name}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border-2 border-border bg-card p-4 shadow-[0_4px_0_var(--border)]">
              <div className="flex items-center gap-4">
                <Character id={side === "w" ? s.whiteChar : s.blackChar} mood="happy" size={88} look={look} />
                <div className="font-display font-bold text-lg">Dress them up!</div>
              </div>
              {LOOK_PARTS.map((part, pi) => (
                <div key={part.key} className="mt-3">
                  <div className="text-sm font-bold text-muted-foreground mb-1">{part.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {part.options.map((opt, oi) => (
                      <button
                        key={opt}
                        onClick={() => setLook(pi, oi)}
                        className={`rounded-full border-2 px-3 py-1 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                          Number(look[pi] ?? 0) === oi
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
