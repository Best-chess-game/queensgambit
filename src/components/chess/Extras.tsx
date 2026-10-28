import { useState } from "react";
import { Character } from "./Character";
import { hasSwearing } from "@/lib/profanity";

type T = (s: string) => string;

export function NameGate({ t, fields, extra, onStart, onBack }: {
  t: T;
  fields: { char: string; value: string; onChange: (v: string) => void; label?: string }[];
  extra?: React.ReactNode;
  onStart: () => void;
  onBack: () => void;
}) {
  const ok = fields.every((f) => f.value.trim() && !hasSwearing(f.value));
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-10">
      <h1 className="text-4xl font-bold text-primary-shade text-center">{t(fields.length > 1 ? "Choose your names" : "Choose your name")}</h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {fields.map((f, i) => (
          <label key={i} className="flex items-center gap-3 rounded-2xl bg-card border-2 border-border p-3">
            <Character id={f.char} mood="happy" size={56} />
            <div className="flex-1">
              {f.label && <div className="text-sm font-bold text-muted-foreground">{f.label}</div>}
              <input value={f.value} maxLength={16} placeholder={t("Your name")} onChange={(e) => f.onChange(e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold" />
              {hasSwearing(f.value) && <div className="text-sm text-destructive font-semibold mt-1">{t("No swearing please!")}</div>}
            </div>
          </label>
        ))}
        {extra}
        <button disabled={!ok} onClick={onStart} className="btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)] disabled:opacity-50">{t("Start")}</button>
        <button onClick={onBack} className="font-display font-bold text-muted-foreground">← {t("Back")}</button>
      </div>
    </main>
  );
}

export function MateBanner({ t, loser, winner, loserChar, winnerChar, onAgain }: { t: T; loser: string; winner: string; loserChar: string; winnerChar: string; onAgain?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 px-4 anim-pop" role="alertdialog" aria-label={t("Checkmate!")}>
      <div className="w-full max-w-md rounded-[2rem] bg-card border-4 border-primary p-6 text-center shadow-[0_8px_0_var(--primary-shade)]">
        <div className="text-6xl font-bold text-destructive font-display tracking-tight">{t("Checkmate!")}</div>
        <div className="mt-4 flex justify-center items-end gap-6">
          <div><Character id={winnerChar} mood="happy" size={90} /><div className="font-bold">🏆 {winner}</div></div>
          <div><Character id={loserChar} mood="sad" size={70} /><div className="font-bold text-muted-foreground">{loser}</div></div>
        </div>
        <p className="mt-3 text-xl font-bold">{loser} {t("is checkmated!")} {winner} {t("wins!")}</p>
        {onAgain && <button onClick={onAgain} className="mt-5 btn-chunky bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shade)]">{t("Play again")}</button>}
      </div>
    </div>
  );
}

export function CommentBox({ t, onSend }: { t: T; onSend: (text: string) => Promise<void> | void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const send = async () => {
    const x = v.trim(); if (!x) return;
    if (hasSwearing(x)) { setErr(t("No swearing please!")); return; }
    setErr("");
    try { await onSend(x); setV(""); } catch { setErr(t("No swearing please!")); }
  };
  return (
    <div className="w-full">
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
        <input value={v} maxLength={60} onChange={(e) => { setV(e.target.value); setErr(""); }} placeholder={t("Say something…")}
          className="flex-1 min-w-0 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-semibold" />
        <button className="rounded-xl bg-secondary text-secondary-foreground px-3 font-display font-bold">{t("Send")}</button>
      </form>
      {err && <div className="text-sm text-destructive font-semibold mt-1">{err}</div>}
    </div>
  );
}
