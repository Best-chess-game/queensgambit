import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board } from "@/components/chess/Board";
import { Character, type Mood } from "@/components/chess/Character";
import { MenuBackdrop } from "@/components/chess/Backdrop";
import { useSettings } from "@/lib/chess-settings";
import { isHanging, material, pickBotMove, VALUE } from "@/lib/chess-ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chess Buddies — Playful chess with feelings" },
      { name: "description", content: "Play chess with expressive characters that cheer your great moves and pout at your blunders." },
      { property: "og:title", content: "Chess Buddies — Playful chess with feelings" },
      { property: "og:description", content: "Expressive characters, custom boards and pieces. Play a friend or the computer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "menu" | "local" | "bot";
type Side = { mood: Mood; say: string; k: number };

const HAPPY = ["Yes!! 🎉", "Got it!", "Ooh, nice!", "Who's the boss?"];
const SAD = ["Oh no…", "Noooo!", "That hurt 😢", "Why did I do that?"];
const rand = (a: string[]) => a[Math.floor(Math.random() * a.length)] ?? "";

function Index() {
  const [mode, setMode] = useState<Mode>("menu");
  if (mode === "menu") return <Menu onPick={setMode} />;
  return <Game mode={mode} onExit={() => setMode("menu")} />;
}

function Menu({ onPick }: { onPick: (m: Mode) => void }) {
  const [s] = useSettings();
  return (
    <>
      <MenuBackdrop />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="flex items-end gap-2">
        <Character id={s.whiteChar} mood="happy" size={110} />
        <Character id={s.blackChar} mood="neutral" size={110} />
      </div>
      <div className="text-center">
        <h1 className="wall-title text-5xl md:text-6xl font-bold text-primary-shade">Chess Buddies</h1>
        <p className="mt-2 text-lg text-muted-foreground">Chess with friends who have feelings.</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => onPick("local")} className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]">Play a friend</button>
        <button onClick={() => onPick("bot")} className="btn-chunky bg-secondary text-secondary-foreground shadow-[0_5px_0_var(--secondary-shade)]">Play the computer</button>
        <Link to="/online" className="btn-chunky text-center bg-accent text-accent-foreground shadow-[0_5px_0_var(--border)]">Play online</Link>
        <Link to="/settings" className="btn-chunky text-center bg-card text-foreground border-2 border-border shadow-[0_5px_0_var(--border)]">Settings</Link>
      </div>
      <p className="text-sm text-muted-foreground">Offline modes work without internet · Online needs a connection</p>
    </main>
    </>
  );
}

function Game({ mode, onExit }: { mode: Exclude<Mode, "menu">; onExit: () => void }) {
  const [s] = useSettings();
  const gameRef = useRef(new Chess());
  const game = gameRef.current;
  const [fen, setFen] = useState(game.fen());
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [captureSq, setCaptureSq] = useState<string | null>(null);
  const [sides, setSides] = useState<Record<"w" | "b", Side>>({
    w: { mood: "neutral", say: "Let's go!", k: 0 },
    b: { mood: "neutral", say: "Bring it on!", k: 0 },
  });

  const react = (who: "w" | "b", mood: Mood, say: string) =>
    setSides((p) => ({ ...p, [who]: { mood, say, k: p[who].k + 1 } }));

  const doMove = (from: Square, to: Square) => {
    const mover = game.turn();
    const opp = mover === "w" ? "b" : "w";
    const m = game.move({ from, to, promotion: "q" });
    if (!m) return;
    setFen(game.fen());
    setLast({ from, to });
    setCaptureSq(m.captured ? to : null);
    const mat = material(game);
    const diff = mover === "w" ? mat.w - mat.b : mat.b - mat.w;

    if (game.isCheckmate()) { react(mover, "happy", "Checkmate! 🏆"); react(opp, "sad", "I lost… 😭"); return; }
    if (game.isDraw()) { react("w", "neutral", "A draw!"); react("b", "neutral", "Good game."); return; }
    if (m.captured && (VALUE[m.captured] ?? 0) >= 5) { react(mover, "happy", m.captured === "q" ? "I got your Queen! 👑" : rand(HAPPY)); react(opp, "sad", rand(SAD)); return; }
    if (isHanging(game, to)) { react(mover, "sad", "Uh oh, bad move…"); react(opp, "happy", "Hehe, thanks!"); return; }
    if (m.captured) { react(mover, "happy", rand(HAPPY)); react(opp, diff >= 3 ? "sad" : "thinking", "Hmm…"); return; }
    if (game.inCheck()) { react(mover, "happy", "Check!"); react(opp, "thinking", "Yikes!"); return; }
    react(mover, diff <= -3 ? "sad" : "neutral", diff <= -3 ? "I'm losing…" : "Your turn.");
    react(opp, diff >= 3 ? "sad" : "thinking", diff >= 3 ? "This is bad…" : "Thinking…");
  };

  useEffect(() => {
    if (mode === "bot" && game.turn() === "b" && !game.isGameOver()) {
      const t = setTimeout(() => {
        const m = pickBotMove(game.fen());
        doMove(m.from, m.to);
      }, 650);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [fen, mode]);

  const reset = () => {
    game.reset(); setFen(game.fen()); setLast(null); setCaptureSq(null);
    setSides({ w: { mood: "neutral", say: "Again!", k: 0 }, b: { mood: "neutral", say: "Rematch!", k: 0 } });
  };

  const over = game.isGameOver();
  const status = game.isCheckmate()
    ? `Checkmate — ${game.turn() === "w" ? (mode === "bot" ? "Computer" : s.blackName) : s.whiteName} wins!`
    : game.isDraw() ? "Draw!" : `${game.turn() === "w" ? s.whiteName : mode === "bot" ? "Computer" : s.blackName} to move`;
  const mat = material(game);

  const Panel = ({ side }: { side: "w" | "b" }) => {
    const d = sides[side];
    const name = side === "w" ? s.whiteName : mode === "bot" ? "Computer" : s.blackName;
    const adv = side === "w" ? mat.w - mat.b : mat.b - mat.w;
    const active = game.turn() === side && !over;
    return (
      <div className={`flex items-center gap-3 rounded-2xl p-3 bg-card border-2 transition-colors ${active ? "border-primary" : "border-border"}`}>
        <Character id={side === "w" ? s.whiteChar : s.blackChar} mood={d.mood} animKey={d.k} size={72} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-lg flex items-center gap-2">
            {name} {adv > 0 && <span className="text-sm rounded-full bg-accent text-accent-foreground px-2">+{adv}</span>}
          </div>
          <div key={d.k} className="anim-float inline-block mt-1 rounded-xl bg-muted px-3 py-1 text-sm font-semibold">{d.say}</div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-4 px-3 py-5">
      <div className="w-full max-w-[600px] flex items-center justify-between">
        <button onClick={onExit} className="font-display font-bold text-muted-foreground">← Menu</button>
        <span className="font-display font-bold">{status}</span>
        <button onClick={reset} className="font-display font-bold text-secondary-shade">New game</button>
      </div>
      <div className="w-full max-w-[600px]"><Panel side="b" /></div>
      <Board game={game} fen={fen} theme={s.theme} pieceSet={s.pieceSet} lastMove={last} captureSq={captureSq}
        disabled={over || (mode === "bot" && game.turn() === "b")} onMove={doMove} />
      <div className="w-full max-w-[600px]"><Panel side="w" /></div>
    </main>
  );
}
