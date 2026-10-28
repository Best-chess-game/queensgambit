// Blocks swear words (English + German) in player comments.
const BAD = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt", "pussy", "whore", "slut", "fag", "nigg", "retard", "wanker", "motherf", "damn", "crap", "piss",
  "scheiß", "scheiss", "scheis", "arschloch", "arsch", "fotze", "hure", "wichser", "fick", "hurensohn", "missgeburt", "spast", "schlampe", "verdammt", "kacke", "depp", "idiot", "behindert",
];
const norm = (s: string) =>
  s.toLowerCase().replace(/0/g, "o").replace(/1|!/g, "i").replace(/3/g, "e").replace(/4|@/g, "a").replace(/5|\$/g, "s").replace(/[^a-zäöüß]/g, "");

export function hasSwearing(text: string) {
  const n = norm(text);
  return BAD.some((w) => n.includes(w));
}

export function cleanComment(text: string) {
  const t = String(text ?? "").trim().slice(0, 60);
  if (!t || hasSwearing(t)) return null;
  return t;
}
