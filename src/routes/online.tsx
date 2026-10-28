import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board } from "@/components/chess/Board";
import { Character, type Mood } from "@/components/chess/Character";
import { useSettings } from "@/lib/chess-settings";
import { supabase } from "@/integrations/supabase/client";
import { cancelMatch, createGame, findMatch, joinGame, playMove, sayLine } from "@/lib/online.functions";
import { makeT } from "@/lib/i18n";
import { sfxFor } from "@/lib/sound";
import { CommentBox, MateBanner, NameGate } from "@/components/chess/Extras";
import { material } from "@/lib/chess-ai";

export const Route = createFileRoute("/online")({
  head: () => ({
    meta: [
      { title: "Play Online — Chess Buddies" },
      { name: "description", content: "Create a game code and play Chess Buddies online with a friend on another device." },
      { property: "og:title", content: "Play Online — Chess Buddies" },
      { property: "og:description", content: "Share a code and play chess with a friend anywhere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (q: Record<string, unknown>): { mode: "friend" | "random" } => ({ mode: q["mode"] === "friend" ? "friend" : "random" }),
  component: Online,
});

type Seat = { id: string; color: "w" | "b"; token: string };
type GameRow = { id: string; fen: string; last_from: string | null; last_to: string | null; captured: string | null; white_name: string; black_name: string | null; white_char: string; black_char: string | null; white_say?: string | null; black_say?: string | null };
const KEY = "chess-buddies-seat";

function Online() {
  const { mode } = Route.useSearch();
  const [s, update] = useSettings();
  const t = makeT(s.lang);
  const [named, setNamed] = useState(false);
  const [waited, setWaited] = useState(0);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const me = { char: s.whiteChar, name: s.whiteName };

  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) setSeat(JSON.parse(r)); } catch {}
  }, []);
  const save = (x: Seat | null) => { setSeat(x); x ? localStorage.setItem(KEY, JSON.stringify(x)) : localStorage.removeItem(KEY); };

  const run = async (fn: () => Promise<Seat>) => {
    setBusy(true); setErr("");
    try { save(await fn()); } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong"); }
    setBusy(false);
  };

  // Random matchmaking: keep polling until paired.
  useEffect(() => {
    if (!searching) return;
    let alive = true;
    let mine: { id: string; token: string } | null = null;
    const tick = async () => {
      try {
        const r = await findMatch({ data: { ...me, mine: mine?.id, token: mine?.token } });
        if (!alive) return;
        if (r.matched) { setSearching(false); save({ id: r.id, color: r.color, token: r.token! }); return; }
        mine = { id: r.id, token: r.token! };
      } catch { /* retry */ }
      if (alive) t = setTimeout(tick, 2500);
    };
    let t = setTimeout(tick, 0);
    setWaited(0);
    const clock = setInterval(() => setWaited((w) => w + 1), 1000);
    return () => {
      alive = false; clearTimeout(t); clearInterval(clock);
      if (mine) cancelMatch({ data: mine }).catch(() => {});
    };
  }, [searching]);

  if (seat) return <OnlineGame seat={seat} onLeave={() => save(null)} />;
  if (!named) return <NameGate t={t} onBack={() => history.back()} onStart={() => setNamed(true)}
    fields={[{ char: s.whiteChar, value: s.whiteName, onChange: (v) => update({ whiteName: v }) }]} />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-10">
      <Character id={s.whiteChar} mood={searching ? "thinking" : "happy"} size={110} />
      <h1 className="text-4xl font-bold text-primary-shade">{t(mode === "friend" ? "Play a friend" : "Play online")}</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {mode === "random" ? (
          searching ? (
            <>
              <p className="text-center font-display font-bold text-lg animate-pulse">{t("Looking for an opponent…")}</p>
              <p className="text-center text-sm text-muted-foreground">{t("Searching for")} {waited}s</p>
              {waited >= 20 && (
                <div role="status" className="rounded-2xl border-2 border-accent bg-card p-3 text-center font-semibold">
                  😴 {t("No opponent online right now. Keep waiting, or play the computer.")}
                </div>
              )}
              <button onClick={() => setSearching(false)} className="btn-chunky bg-card text-foreground border-2 border-border shadow-[0_5px_0_var(--border)]">{t("Cancel")}</button>
            </>
          ) : (
            <>
              <p className="text-center text-muted-foreground">{t("We'll pair you with someone else who's online right now.")}</p>
              <button onClick={() => setSearching(true)} className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]">{t("Find a match")}</button>
            </>
          )
        ) : (
          <>
            <button disabled={busy} onClick={() => run(() => createGame({ data: me }))}
              className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]">{t("Create a code")}</button>
            <div className="text-center text-muted-foreground font-semibold">{t("or enter your friend's code")}</div>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6}
              className="rounded-xl border-2 border-border bg-card px-4 py-3 text-center text-2xl font-bold tracking-widest" />
            <button disabled={busy || code.length < 6} onClick={() => run(() => joinGame({ data: { id: code, ...me } }))}
              className="btn-chunky bg-secondary text-secondary-foreground shadow-[0_5px_0_var(--secondary-shade)] disabled:opacity-50">{t("Join game")}</button>
          </>
        )}
        {err && <p className="text-center text-destructive font-semibold">{err}</p>}
        <Link to="/" className="text-center font-display font-bold text-muted-foreground">← {t("Menu")}</Link>
      </div>
    </main>
  );
}

function OnlineGame({ seat, onLeave }: { seat: Seat; onLeave: () => void }) {
  const [s] = useSettings();
  const t = makeT(s.lang);
  const [row, setRow] = useState<GameRow | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase.from("games").select("*").eq("id", seat.id).maybeSingle().then(({ data }) => data ? setRow(data) : setMissing(true));
    const ch = supabase.channel(`game-${seat.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${seat.id}` }, (p) => setRow((old) => {
        const n = p.new as GameRow;
        if (old && old.fen !== n.fen && n.last_from) { const g = new Chess(n.fen); sfxFor({ captured: n.captured }, g); }
        return n;
      }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [seat.id]);

  const game = useMemo(() => new Chess(row?.fen), [row?.fen]);

  if (missing) return <main className="min-h-screen grid place-items-center"><button onClick={onLeave} className="btn-chunky bg-card border-2 border-border">{t("Game not found — back")}</button></main>;
  if (!row) return <main className="min-h-screen grid place-items-center font-display font-bold">{t("Loading…")}</main>;

  const waiting = !row.black_name;
  const myTurn = game.turn() === seat.color && !waiting && !game.isGameOver();
  const mat = material(game);
  const lastMover = game.turn() === "w" ? "b" : "w";

  const mood = (side: "w" | "b"): { mood: Mood; say: string } => {
    const adv = side === "w" ? mat.w - mat.b : mat.b - mat.w;
    if (game.isCheckmate()) return game.turn() === side ? { mood: "sad", say: t("I lost… 😭") } : { mood: "happy", say: t("Checkmate! 🏆") };
    if (game.isDraw()) return { mood: "neutral", say: "A draw!" };
    if (row.captured && lastMover === side) return { mood: "happy", say: row.captured === "q" ? "I got your Queen! 👑" : "Got it!" };
    if (row.captured && lastMover !== side) return { mood: "sad", say: "Noooo!" };
    if (game.inCheck() && game.turn() === side) return { mood: "thinking", say: "Yikes!" };
    if (adv <= -3) return { mood: "sad", say: "I'm losing…" };
    if (adv >= 3) return { mood: "happy", say: "Going well!" };
    return { mood: game.turn() === side ? "thinking" : "neutral", say: game.turn() === side ? "Thinking…" : "Your turn." };
  };

  const onMove = async (from: Square, to: Square) => {
    const optimistic = new Chess(row.fen);
    const m = optimistic.move({ from, to, promotion: "q" });
    setRow({ ...row, fen: optimistic.fen(), last_from: from, last_to: to, captured: m.captured ?? null });
    try { await playMove({ data: { id: seat.id, token: seat.token, from, to } }); }
    catch { supabase.from("games").select("*").eq("id", seat.id).maybeSingle().then(({ data }) => data && setRow(data)); }
  };

  const Panel = ({ side }: { side: "w" | "b" }) => {
    const d = mood(side);
    const name = side === "w" ? row.white_name : row.black_name ?? t("Waiting…");
    const said = side === "w" ? row.white_say : row.black_say;
    const ch = side === "w" ? row.white_char : row.black_char ?? "owl";
    const active = game.turn() === side && !game.isGameOver();
    return (
      <div className={`flex items-center gap-3 rounded-2xl p-3 bg-card border-2 ${active ? "border-primary" : "border-border"}`}>
        <Character id={ch} mood={d.mood} animKey={row.fen.length + (d.mood === "happy" ? 1 : 0)} size={72} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-lg">{name} {side === seat.color && <span className="text-sm text-muted-foreground">{t("(you)")}</span>}</div>
          <div key={row.fen + side} className="anim-float inline-block mt-1 rounded-xl bg-muted px-3 py-1 text-sm font-semibold">{said ? `💬 ${said}` : t(d.say)}</div>
          {side === seat.color && !waiting && <div className="mt-2"><CommentBox t={t} onSend={async (text) => { await sayLine({ data: { id: seat.id, token: seat.token, text } }); }} /></div>}
        </div>
      </div>
    );
  };

  const top = seat.color === "w" ? "b" : "w";
  const status = waiting ? (row.id.startsWith("~") ? t("Waiting for opponent…") : `${t("Share code")} ${row.id} ${t("with your friend")}`) : t(game.isCheckmate() ? "Checkmate!" : game.isDraw() ? "Draw!" : myTurn ? "Your move" : "Opponent's move");

  return (
    <main className="min-h-screen flex flex-col items-center gap-4 px-3 py-5">
      <div className="w-full max-w-[600px] flex items-center justify-between">
        <button onClick={onLeave} className="font-display font-bold text-muted-foreground">← {t("Leave")}</button>
        <span className="font-display font-bold">{status}</span>
        <span className="font-display font-bold text-secondary-shade tracking-widest">{row.id.startsWith("~") ? "" : row.id}</span>
      </div>
      <div className="w-full max-w-[600px]"><Panel side={top} /></div>
      <Board game={game} fen={row.fen} theme={s.theme} pieceSet={s.pieceSet} flipped={seat.color === "b"}
        lastMove={row.last_from && row.last_to ? { from: row.last_from, to: row.last_to } : null}
        captureSq={row.captured ? row.last_to : null} disabled={!myTurn} onMove={onMove} />
      <div className="w-full max-w-[600px]"><Panel side={seat.color} /></div>
      {game.isCheckmate() && (() => { const l = game.turn(); const nm = (c: "w" | "b") => (c === "w" ? row.white_name : row.black_name) ?? ""; const ch = (c: "w" | "b") => (c === "w" ? row.white_char : row.black_char) ?? "owl"; const w = l === "w" ? "b" : "w"; return (
        <MateBanner t={t} loser={nm(l)} winner={nm(w)} loserChar={ch(l)} winnerChar={ch(w)} onAgain={onLeave} />); })()}
    </main>
  );
}
