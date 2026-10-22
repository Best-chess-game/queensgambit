import { useEffect, useState } from "react";

export const BOARD_THEMES = [
  { id: "classic", name: "Classic", desc: "Black & eggshell" },
  { id: "red", name: "Inferno", desc: "Black & red" },
  { id: "green", name: "Meadow", desc: "White & green" },
  { id: "ocean", name: "Ocean", desc: "Sky & deep blue" },
  { id: "mixed", name: "Carnival", desc: "Mixed colours" },
  { id: "marble", name: "Marble", desc: "Polished stone" },
  { id: "jade", name: "Jade", desc: "Green gemstone" },
  { id: "wood", name: "Walnut", desc: "Carved wood" },
] as const;

export const PIECE_SETS = [
  { id: "classic", name: "Classic" },
  { id: "letters", name: "Tokens" },
  { id: "stone", name: "Stones" },
  { id: "neon", name: "Neon" },
] as const;

export const CHARACTERS = [
  { id: "pip", name: "Pip", color: "var(--char-1)" },
  { id: "ember", name: "Ember", color: "var(--char-2)" },
  { id: "bloop", name: "Bloop", color: "var(--char-3)" },
  { id: "sunny", name: "Sunny", color: "var(--char-4)" },
] as const;

export type Settings = {
  theme: string;
  pieceSet: string;
  whiteChar: string;
  blackChar: string;
  whiteName: string;
  blackName: string;
};

const DEFAULT: Settings = {
  theme: "classic",
  pieceSet: "classic",
  whiteChar: "pip",
  blackChar: "ember",
  whiteName: "Player 1",
  blackName: "Player 2",
};
const KEY = "chess-buddies-settings";

export function useSettings() {
  const [s, setS] = useState<Settings>(DEFAULT);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const update = (p: Partial<Settings>) =>
    setS((prev) => {
      const n = { ...prev, ...p };
      localStorage.setItem(KEY, JSON.stringify(n));
      return n;
    });
  return [s, update] as const;
}
