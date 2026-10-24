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
  { id: "pip", name: "Olive", color: "var(--char-1)", shape: "round" },
  { id: "ember", name: "Ruby", color: "var(--char-2)", shape: "tall" },
  { id: "bloop", name: "Marina", color: "var(--char-3)", shape: "wide" },
  { id: "sunny", name: "Sunny", color: "var(--char-4)", shape: "round" },
] as const;

/** Customisation options. A look is stored as 5 digits: hair, eyes, clothes, hat, colour. */
export const LOOK_PARTS = [
  { key: "hair", label: "Hair", options: ["None", "Spiky", "Curly", "Long", "Mohawk"] },
  { key: "eyes", label: "Eyes", options: ["Round", "Sparkly", "Sleepy", "Glasses"] },
  { key: "clothes", label: "Clothes", options: ["None", "T-shirt", "Bow tie", "Scarf", "Hoodie"] },
  { key: "hat", label: "Extras", options: ["None", "Crown", "Cap", "Flower", "Headphones"] },
  { key: "color", label: "Colour", options: ["Default", "Pink", "Purple", "Teal", "Orange", "Mint", "Grey"] },
] as const;

export const LOOK_COLORS = [
  "", "oklch(0.78 0.15 350)", "oklch(0.65 0.18 300)", "oklch(0.7 0.12 195)",
  "oklch(0.75 0.17 55)", "oklch(0.85 0.12 160)", "oklch(0.7 0.02 250)",
];

export const DEFAULT_LOOK = "00000";

export function parseLook(look: string | undefined) {
  const d = (i: number) => {
    const n = Number((look ?? "")[i]);
    return Number.isFinite(n) && n < (LOOK_PARTS[i]?.options.length ?? 0) ? n : 0;
  };
  return { hair: d(0), eyes: d(1), clothes: d(2), hat: d(3), color: d(4) };
}

export function setLookPart(look: string, index: number, value: number) {
  const a = (look || DEFAULT_LOOK).padEnd(5, "0").split("");
  a[index] = String(value);
  return a.join("");
}

/** Combined character id + look, e.g. "pip:21300". Used for online play too. */
export const charCode = (id: string, look: string) => `${id}:${look || DEFAULT_LOOK}`;

export type Settings = {
  theme: string;
  pieceSet: string;
  whiteChar: string;
  blackChar: string;
  whiteLook: string;
  blackLook: string;
  whiteName: string;
  blackName: string;
};

const DEFAULT: Settings = {
  theme: "classic",
  pieceSet: "classic",
  whiteChar: "pip",
  blackChar: "ember",
  whiteLook: DEFAULT_LOOK,
  blackLook: DEFAULT_LOOK,
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
