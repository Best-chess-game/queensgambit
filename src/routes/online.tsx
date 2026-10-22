import { ColorPicker } from "@/components/chess/ColorPicker";
import { gameWithHistory } from "@/lib/game-history";
import { BoardWithHistory } from "@/components/chess/MoveHistory";
import { Comments } from "@/components/chess/Comments";
import { cleanComment, type Comment } from "@/lib/comments";
import { resultText, type Promotion } from "@/lib/game-rules";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Chess, type Color, type Square } from "chess.js";
import { Board } from "@/components/chess/Board";
import { Character, type Mood } from "@/components/chess/Character";
import { useSettings } from "@/lib/chess-settings";
import { supabase } from "@/integrations/supabase/client";
import { createGame, joinGame, playMove, sendComment } from "@/lib/online.functions";
import { material } from "@/lib/chess-ai";

export const Route = createFileRoute("/online")({
  head: () => ({
    meta: [
      { title: "Play Online — Chess Buddies" },
      {
        name: "description",
        content:
          "Create a game code and play Chess Buddies online with a friend on another device.",
      },
      { property: "og:title", content: "Play Online — Chess Buddies" },
      {
        property: "og:description",
        content: "Share a code and play chess with a friend anywhere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Online,
});

type Seat = { id: string; color: "w" | "b"; token: string };
type GameRow = {
  id: string;
  fen: string;
  pgn?: string;
  last_from: string | null;
  last_to: string | null;
  captured: string | null;
  white_name: string;
  black_name: string | null;
  white_char: string;
  black_char: string | null;
};
const KEY = "chess-buddies-seat";

function Online() {
  const [s] = useSettings();
  const [seat, setSeat] = useState<Seat | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<Color>("w");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY);
      if (r) setSeat(JSON.parse(r));
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);
  const save = (x: Seat | null) => {
    setSeat(x);
    if (x) localStorage.setItem(KEY, JSON.stringify(x));
    else localStorage.removeItem(KEY);
  };

  const run = async (fn: () => Promise<Seat>) => {
    setBusy(true);
    setErr("");
    try {
      save(await fn());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    }
    setBusy(false);
  };

  if (seat) return <OnlineGame seat={seat} onLeave={() => save(null)} />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-10">
      <Character id={s.whiteChar} mood="happy" size={100} />
      <h1 className="text-4xl font-bold text-primary-shade">Play Online</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <label>
          Your name
          <input
            required
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3"
          />
        </label>
        <ColorPicker value={color} onChange={setColor} />
        <button
          disabled={busy || !name.trim()}
          onClick={() =>
            run(() => createGame({ data: { name: name.trim(), char: s.whiteChar, color } }))
          }
          className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]"
        >
          Create a game
        </button>
        <div className="text-center text-muted-foreground font-semibold">or join with a code</div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          className="rounded-xl border-2 border-border bg-card px-4 py-3 text-center text-2xl font-bold tracking-widest"
        />
        <button
          disabled={busy || !name.trim() || code.length < 6}
          onClick={() =>
            run(() => joinGame({ data: { id: code, name: name.trim(), char: s.whiteChar, color } }))
          }
          className="btn-chunky bg-secondary text-secondary-foreground shadow-[0_5px_0_var(--secondary-shade)] disabled:opacity-50"
        >
          Join game
        </button>
        {err && <p className="text-center text-destructive font-semibold">{err}</p>}
        <Link to="/" className="text-center font-display font-bold text-muted-foreground">
          ← Menu
        </Link>
      </div>
    </main>
  );
}

function OnlineGame({ seat, onLeave }: { seat: Seat; onLeave: () => void }) {
  const [s] = useSettings();
  const [row, setRow] = useState<GameRow | null>(null);
  const [messages, setMessages] = useState<Comment[]>([]);
  const [moveError, setMoveError] = useState("");
  const [sending, setSending] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase
      .from("games")
      .select("*")
      .eq("id", seat.id)
      .maybeSingle()
      .then(({ data }) => (data ? setRow(data) : setMissing(true)));
    const ch = supabase
      .channel(`game-${seat.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${seat.id}` },
        (p) => setRow(p.new as GameRow),
      )
      .subscribe();
    const poll = window.setInterval(() => {
      supabase
        .from("games")
        .select("*")
        .eq("id", seat.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setRow(data);
        });
    }, 3000);
    return () => {
      window.clearInterval(poll);
      void supabase.removeChannel(ch);
    };
  }, [seat.id]);

  useEffect(() => {
    setMessages([]);
    const ch = supabase
      .channel(`comments-${seat.id}`)
      .on("broadcast", { event: "comment" }, ({ payload }: { payload: Partial<Comment> }) => {
        try {
          if (
            typeof payload.id !== "string" ||
            typeof payload.name !== "string" ||
            typeof payload.text !== "string"
          )
            return;
          const message = {
            id: payload.id,
            name: cleanComment(payload.name),
            text: cleanComment(payload.text),
          };
          setMessages((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev.slice(-49), message],
          );
        } catch {
          /* Ignore unmoderated broadcasts. */
        }
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [seat.id]);

  const game = useMemo(() => (row ? gameWithHistory(row.fen, row.pgn) : new Chess()), [row]);

  if (missing)
    return (
      <main className="min-h-screen grid place-items-center">
        <button onClick={onLeave} className="btn-chunky bg-card border-2 border-border">
          Game not found — back
        </button>
      </main>
    );
  if (!row)
    return (
      <main className="min-h-screen grid place-items-center font-display font-bold">Loading…</main>
    );

  const waiting = !row.white_name || !row.black_name;
  const myTurn = game.turn() === seat.color && !waiting && !game.isGameOver();
  const mat = material(game);

  const mood = (side: "w" | "b"): Mood => {
    if (game.isCheckmate()) return game.turn() === side ? "sad" : "happy";
    if (game.isDraw()) return "neutral";
    const adv = side === "w" ? mat.w - mat.b : mat.b - mat.w;
    return adv <= -3 ? "sad" : adv >= 3 ? "happy" : game.turn() === side ? "thinking" : "neutral";
  };

  const onMove = async (from: Square, to: Square, promotion: Promotion = "q") => {
    if (!myTurn || sending) return;
    setSending(true);
    setMoveError("");
    try {
      await playMove({ data: { id: seat.id, token: seat.token, from, to, promotion } });
      const { data, error } = await supabase.from("games").select("*").eq("id", seat.id).single();
      if (error) throw error;
      setRow(data);
    } catch (e) {
      setMoveError(e instanceof Error ? e.message : "Move failed. Try again.");
    } finally {
      setSending(false);
    }
  };

  const Panel = ({ side }: { side: "w" | "b" }) => {
    const d = mood(side);
    const name = (side === "w" ? row.white_name : row.black_name) || "Waiting…";
    const ch = side === "w" ? row.white_char : (row.black_char ?? "ember");
    const active = game.turn() === side && !game.isGameOver();
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl p-3 bg-card border-2 ${active ? "border-primary" : "border-border"}`}
      >
        <Character id={ch} mood={d} size={72} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-lg">
            {name}{" "}
            {side === seat.color && <span className="text-sm text-muted-foreground">(you)</span>}
          </div>
        </div>
      </div>
    );
  };

  const top = seat.color === "w" ? "b" : "w";
  const result = resultText(game, { w: row.white_name, b: row.black_name ?? "Black" });
  const status = waiting
    ? `Share code ${row.id} with your friend`
    : result
      ? result
      : myTurn
        ? "Your move"
        : "Opponent's move";

  return (
    <main className="min-h-screen flex flex-col items-center gap-4 px-3 py-5 min-[900px]:pr-[248px]">
      <div className="w-full max-w-[600px] flex items-center justify-between">
        <button onClick={onLeave} className="font-display font-bold text-muted-foreground">
          ← Leave
        </button>
        <span className="font-display font-bold">{status}</span>
        <span className="font-display font-bold text-secondary-shade tracking-widest">
          {row.id}
        </span>
      </div>
      {result && (
        <div
          role="status"
          className="w-full max-w-[600px] rounded-2xl bg-accent text-accent-foreground p-4 text-center text-xl font-bold"
        >
          {result}
        </div>
      )}
      {moveError && (
        <p role="alert" className="text-destructive">
          {moveError}
        </p>
      )}
      <div className="w-full max-w-[600px]">
        <Panel side={top} />
      </div>
      <BoardWithHistory game={game}>
        <Board
          game={game}
          fen={row.fen}
          theme={s.theme}
          pieceSet={s.pieceSet}
          flipped={seat.color === "b"}
          lastMove={row.last_from && row.last_to ? { from: row.last_from, to: row.last_to } : null}
          captureSq={row.captured ? row.last_to : null}
          disabled={!myTurn || sending}
          onMove={onMove}
        />
      </BoardWithHistory>
      <div className="w-full max-w-[600px]">
        <Panel side={seat.color} />
      </div>
      <Comments
        messages={messages}
        names={[seat.color === "w" ? row.white_name : (row.black_name ?? "Black")]}
        disabled={waiting}
        onSend={async (text) => {
          const message = await sendComment({ data: { id: seat.id, token: seat.token, text } });
          setMessages((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev.slice(-49), message],
          );
        }}
      />
    </main>
  );
}
