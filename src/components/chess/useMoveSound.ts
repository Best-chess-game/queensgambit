import { useCallback, useEffect, useRef } from "react";

export function useMoveSound() {
  const context = useRef<AudioContext | null>(null);
  const moveSound = useRef<Promise<AudioBuffer | null> | null>(null);
  const queenSound = useRef<Promise<AudioBuffer | null> | null>(null);
  const generation = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const unlock = useCallback(() => {
    if (typeof window.AudioContext !== "function") return;
    try {
      context.current ??= new AudioContext();
      const audio = context.current;
      const load = (path: string) =>
        fetch(path)
          .then((response) => {
            if (!response.ok) throw new Error("Audio unavailable");
            return response.arrayBuffer();
          })
          .then((bytes) => audio.decodeAudioData(bytes))
          .catch(() => null);
      moveSound.current ??= load("/sounds/move-chesscom.mp3");
      queenSound.current ??= load("/sounds/queen-capture.mp3");
      if (context.current.state === "suspended") void context.current.resume().catch(() => {});
    } catch {
      /* Unavailable audio must never interrupt a move. */
    }
  }, []);
  const cancel = useCallback(() => {
    generation.current++;
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);
  useEffect(() => {
    // Browsers require a user gesture before allowing sound.
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      cancel();
      if (context.current) void context.current.close().catch(() => {});
      context.current = null;
      moveSound.current = null;
      queenSound.current = null;
    };
  }, [cancel, unlock]);
  const play = useCallback(
    (delay = 0, capturedQueen = false) => {
      unlock();
      const currentGeneration = generation.current;
      const timer = setTimeout(async () => {
        timers.current.delete(timer);
        const audio = context.current;
        if (!audio || audio.state !== "running") return;
        try {
          const source = audio.createBufferSource();
          const volume = audio.createGain();
          const recording = capturedQueen
            ? ((await queenSound.current) ?? (await moveSound.current))
            : await moveSound.current;
          if (!recording) return;
          if (context.current !== audio || generation.current !== currentGeneration) return;
          source.buffer = recording;
          volume.gain.value = capturedQueen ? 0.65 : 0.45;
          source.connect(volume).connect(audio.destination);
          source.onended = () => {
            source.disconnect();
            volume.disconnect();
          };
          source.start();
        } catch {
          /* Keep gameplay working if the audio device changes. */
        }
      }, delay);
      timers.current.add(timer);
    },
    [unlock],
  );
  return { play, cancel };
}
