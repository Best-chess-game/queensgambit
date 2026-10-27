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
  { id: "pip", name: "Olive", skin: "oklch(0.85 0.07 80)", hair: "oklch(0.4 0.08 60)", shirt: "var(--char-1)" },
  { id: "ember", name: "Ruby", skin: "oklch(0.72 0.09 65)", hair: "oklch(0.3 0.04 60)", shirt: "var(--char-2)" },
  { id: "bloop", name: "Marina", skin: "oklch(0.88 0.06 85)", hair: "oklch(0.75 0.12 85)", shirt: "var(--char-3)" },
  { id: "sunny", name: "Sunny", skin: "oklch(0.6 0.09 60)", hair: "oklch(0.28 0.05 50)", shirt: "var(--char-4)" },
] as const;

/** Customisation options. A look is stored as 5 digits: hair, eyes, clothes, hat, colour. */
export const LOOK_PARTS = [
  { key: "hair", label: "Hair", options: ["None", "Spiky", "Curly", "Long", "Mohawk"] },
  { key: "eyes", label: "Eyes", options: ["Round", "Sparkly", "Sleepy", "Glasses"] },
  { key: "clothes", label: "Clothes", options: ["None", "T-shirt", "Bow tie", "Scarf", "Hoodie"] },
  { key: "hat", label: "Extras", options: ["None", "Crown", "Cap", "Flower", "Headphones"] },
  { key: "color", label: "Skin tone", options: ["Default", "Light", "Fair", "Tan", "Brown", "Dark", "Deep"] },
] as const;

export const LOOK_COLORS = [
  "", "oklch(0.9 0.05 85)", "oklch(0.85 0.07 80)", "oklch(0.76 0.08 70)",
  "oklch(0.65 0.09 60)", "oklch(0.52 0.08 55)", "oklch(0.42 0.06 50)",
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
