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
  { id: "fox", name: "Fox" },
  { id: "owl", name: "Owl" },
  { id: "cat", name: "Cat" },
  { id: "frog", name: "Frog" },
  { id: "panda", name: "Panda" },
  { id: "robot", name: "Robot" },
] as const;

export type Settings = {
  theme: string;
  pieceSet: string;
  whiteChar: string;
  blackChar: string;
  whiteName: string;
  blackName: string;
  lang: string;
  difficulty: string;
};

const DEFAULT: Settings = {
  theme: "classic",
  pieceSet: "classic",
  whiteChar: "fox",
  blackChar: "owl",
  whiteName: "Player 1",
  blackName: "Player 2",
  lang: "en",
  difficulty: "medium",
};
const KEY = "chess-buddies-settings";

export function useSettings() {
  const [s, setS] = useState<Settings>(DEFAULT);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = { ...DEFAULT, ...JSON.parse(raw) };
        const ok = (id: string) => CHARACTERS.some((c) => c.id === id);
        if (!ok(v.whiteChar)) v.whiteChar = DEFAULT.whiteChar;
        if (!ok(v.blackChar)) v.blackChar = DEFAULT.blackChar;
        setS(v);
      }
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
