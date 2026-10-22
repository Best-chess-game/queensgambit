// Normalize common substitutions and separated letters before checking English profanity.
const words = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "arsehole",
  "cunt",
  "dick",
  "cock",
  "pussy",
  "motherfucker",
  "bullshit",
  "wanker",
  "twat",
  "damn",
  "crap",
  "piss",
  "slut",
  "whore",
  "nigger",
  "faggot",
];
export function cleanComment(value: string) {
  const text = value.trim();
  if (!text || text.length > 200) throw new Error("Write a comment between 1 and 200 characters.");
  const normalized = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u200b-\u200f]/g, "")
    .toLowerCase()
    .replace(
      /[013457@$!]/g,
      (c) =>
        ({
          "0": "o",
          "1": "i",
          "3": "e",
          "4": "a",
          "5": "s",
          "7": "t",
          "@": "a",
          $: "s",
          "!": "i",
        })[c] ?? c,
    );
  if (
    /\bass\b/i.test(normalized) ||
    words.some((word) =>
      new RegExp(
        `\\b${word
          .split("")
          .map((letter) => `${letter}+`)
          .join("[\\W_]*")}\\w*\\b`,
        "i",
      ).test(normalized),
    )
  )
    throw new Error("Please rewrite your comment without swear words.");
  return text;
}
export function playerName(value: string) {
  const name = value.trim();
  if (!name || name.length > 24) throw new Error("Enter a name between 1 and 24 characters.");
  return cleanComment(name);
}
export type Comment = { id: string; name: string; text: string };
