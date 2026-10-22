import { Comments } from "@/components/chess/Comments";
import { playerName, type Comment } from "@/lib/comments";
import { resultText, type Promotion } from "@/lib/game-rules";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board } from "@/components/chess/Board";
import { Character } from "@/components/chess/Character";
import { MenuBackdrop } from "@/components/chess/Backdrop";
import { useSettings } from "@/lib/chess-settings";
import { material, pickBotMove } from "@/lib/chess-ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chess Buddies — Playful chess with feelings" },
      {
        name: "description",
        content:
          "Play chess with expressive characters that cheer your great moves and pout at your blunders.",
      },
      { property: "og:title", content: "Chess Buddies — Playful chess with feelings" },
      {
        property: "og:description",
        content: "Expressive characters, custom boards and pieces. Play a friend or the computer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "menu" | "local" | "bot";
function Index() {
  const [mode, setMode] = useState<Mode>("menu");
  if (mode === "menu") return <Menu onPick={setMode} />;
  return <Setup mode={mode} onExit={() => setMode("menu")} />;
}

function Setup({ mode, onExit }: { mode: "local" | "bot"; onExit: () => void }) {
  const [names, setNames] = useState<{ w: string; b: string } | null>(null);
  const [white, setWhite] = useState("");
  const [black, setBlack] = useState("");
  const [error, setError] = useState("");
  if (names) return <Game mode={mode} names={names} onExit={onExit} />;
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form
        className="w-full max-w-sm flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            setNames({ w: playerName(white), b: mode === "bot" ? "Computer" : playerName(black) });
          } catch (e) {
            setError(e instanceof Error ? e.message : "Enter your names.");
          }
        }}
      >
        <h1 className="text-3xl font-bold">Player names</h1>
        <label>
          White player
          <input
            required
            maxLength={24}
            value={white}
            onChange={(e) => setWhite(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card p-3"
          />
        </label>
        {mode === "local" && (
          <label>
            Black player
            <input
              required
              maxLength={24}
              value={black}
              onChange={(e) => setBlack(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-card p-3"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <button className="btn-chunky bg-primary text-primary-foreground">Play</button>
        <button type="button" onClick={onExit}>
          Back
        </button>
      </form>
    </main>
  );
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
          <h1 className="wall-title text-5xl md:text-6xl font-bold text-primary-shade">
            Chess Buddies
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Chess with friends who have feelings.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => onPick("local")}
            className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]"
          >
            Play a friend
          </button>
          <button
            onClick={() => onPick("bot")}
            className="btn-chunky bg-secondary text-secondary-foreground shadow-[0_5px_0_var(--secondary-shade)]"
          >
            Play the computer
          </button>
          <Link
            to="/online"
            className="btn-chunky text-center bg-accent text-accent-foreground shadow-[0_5px_0_var(--border)]"
          >
            Play online
          </Link>
          <Link
            to="/settings"
            className="btn-chunky text-center bg-card text-foreground border-2 border-border shadow-[0_5px_0_var(--border)]"
          >
            Settings
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Offline modes work without internet · Online needs a connection
        </p>
      </main>
    </>
  );
}

function Game({
  mode,
  names,
  onExit,
}: {
  mode: Exclude<Mode, "menu">;
  names: { w: string; b: string };
  onExit: () => void;
}) {
  const [s] = useSettings();
  const gameRef = useRef(new Chess());
  const game = gameRef.current;
  const [fen, setFen] = useState(game.fen());
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [captureSq, setCaptureSq] = useState<string | null>(null);
  const [messages, setMessages] = useState<Comment[]>([]);
  const doMove = useCallback(
    (from: Square, to: Square, promotion: Promotion = "q") => {
      game.move({ from, to, promotion });
      setFen(game.fen());
      const move = game.history({ verbose: true }).at(-1);
      setLast({ from, to });
      setCaptureSq(move?.captured ? to : null);
    },
    [game],
  );

  useEffect(() => {
    if (mode === "bot" && game.turn() === "b" && !game.isGameOver()) {
      const t = setTimeout(() => {
        const m = pickBotMove(game.fen());
        doMove(m.from, m.to, m.promotion as Promotion | undefined);
      }, 650);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [fen, mode, game, doMove]);

  const reset = () => {
    game.reset();
    setFen(game.fen());
    setLast(null);
    setCaptureSq(null);
    setMessages([]);
  };

  const over = game.isGameOver();
  const result = resultText(game, names);
  const status = result ?? `${names[game.turn()]} to move`;
  const mat = material(game);

  const Panel = ({ side }: { side: "w" | "b" }) => {
    const name = names[side];
    const adv = side === "w" ? mat.w - mat.b : mat.b - mat.w;
    const active = game.turn() === side && !over;
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl p-3 bg-card border-2 transition-colors ${active ? "border-primary" : "border-border"}`}
      >
        <Character
          id={side === "w" ? s.whiteChar : s.blackChar}
          mood={
            over
              ? game.isDraw()
                ? "neutral"
                : game.turn() === side
                  ? "sad"
                  : "happy"
              : game.turn() === side
                ? "thinking"
                : "neutral"
          }
          size={72}
        />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-lg flex items-center gap-2">
            {name}{" "}
            {adv > 0 && (
              <span className="text-sm rounded-full bg-accent text-accent-foreground px-2">
                +{adv}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-4 px-3 py-5">
      <div className="w-full max-w-[600px] flex items-center justify-between">
        <button onClick={onExit} className="font-display font-bold text-muted-foreground">
          ← Menu
        </button>
        <span className="font-display font-bold">{status}</span>
        <button onClick={reset} className="font-display font-bold text-secondary-shade">
          New game
        </button>
      </div>
      {result && (
        <div
          role="status"
          className="w-full max-w-[600px] rounded-2xl bg-accent text-accent-foreground p-4 text-center text-xl font-bold"
        >
          {result}
        </div>
      )}
      <div className="w-full max-w-[600px]">
        <Panel side="b" />
      </div>
      <Board
        game={game}
        fen={fen}
        theme={s.theme}
        pieceSet={s.pieceSet}
        lastMove={last}
        captureSq={captureSq}
        disabled={over || (mode === "bot" && game.turn() === "b")}
        onMove={doMove}
      />
      <div className="w-full max-w-[600px]">
        <Panel side="w" />
      </div>
      <Comments
        messages={messages}
        names={mode === "local" ? [names.w, names.b] : [names.w]}
        onSend={async (text, name) => {
          setMessages((prev) => [...prev.slice(-49), { id: crypto.randomUUID(), name, text }]);
        }}
      />
    </main>
  );
}
