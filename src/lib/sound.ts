let ctx: AudioContext | null = null;
const ac = () => {
  if (typeof window === "undefined") return null;
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
};

function tone(freq: number, dur: number, type: OscillatorType = "triangle", delay = 0, vol = 0.25) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur);
}

export type Sfx = "move" | "capture" | "check" | "mate" | "bad";
export function playSfx(s: Sfx) {
  try {
    if (s === "move") { tone(220, 0.08, "square", 0, 0.12); tone(160, 0.1, "triangle", 0.02, 0.2); }
    if (s === "capture") { tone(300, 0.07, "square", 0, 0.18); tone(120, 0.18, "sawtooth", 0.05, 0.15); }
    if (s === "check") { tone(660, 0.12); tone(880, 0.18, "triangle", 0.1); }
    if (s === "bad") { tone(330, 0.15, "sine"); tone(247, 0.25, "sine", 0.14); }
    if (s === "mate") [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, "triangle", i * 0.14, 0.22));
  } catch {}
}

/** Sound for a move given the position after it. */
export function sfxFor(m: { captured?: string | null }, after: { isCheckmate(): boolean; inCheck(): boolean }) {
  playSfx(after.isCheckmate() ? "mate" : after.inCheck() ? "check" : m.captured ? "capture" : "move");
}
