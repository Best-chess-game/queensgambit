let ctx: AudioContext | null = null;
const ac = () => {
  if (typeof window === "undefined") return null;
  ctx ??= new (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  )();
  return ctx;
};

function tone(freq: number, dur: number, type: OscillatorType = "triangle", delay = 0, vol = 0.25) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(),
    g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

const recordings = new Map<string, HTMLAudioElement>();

function playRecording(path: string, volume: number) {
  if (typeof window === "undefined") return;
  let recording = recordings.get(path);
  if (!recording) {
    recording = new Audio(path);
    recordings.set(path, recording);
  }
  recording.pause();
  recording.currentTime = 0;
  recording.volume = volume;
  void recording.play().catch(() => {
    // Audio restrictions must never interrupt gameplay.
  });
}

export type Sfx = "move" | "capture" | "check" | "mate" | "bad";
export function playSfx(s: Sfx, capturedQueen = false) {
  try {
    if (s === "mate" || capturedQueen) {
      playRecording("/sounds/queen-capture.mp3", 0.65);
      return;
    }
    if (s === "move" || s === "capture") {
      playRecording("/sounds/move-chesscom.mp3", 0.45);
      return;
    }
    if (s === "check") {
      tone(660, 0.12);
      tone(880, 0.18, "triangle", 0.1);
    }
    if (s === "bad") {
      tone(330, 0.15, "sine");
      tone(247, 0.25, "sine", 0.14);
    }
  } catch {
    // Unavailable audio must never interrupt gameplay.
  }
}

/** Sound for a move given the position after it. */
export function sfxFor(
  m: { captured?: string | null },
  after: { isCheckmate(): boolean; inCheck(): boolean },
) {
  playSfx(
    after.isCheckmate() ? "mate" : after.inCheck() ? "check" : m.captured ? "capture" : "move",
    m.captured === "q",
  );
}
