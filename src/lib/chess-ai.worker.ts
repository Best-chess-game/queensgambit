import { pickBotMove, type Difficulty } from "./chess-ai";

self.onmessage = (event: MessageEvent<{ fen: string; difficulty: Difficulty }>) => {
  const move = pickBotMove(event.data.fen, event.data.difficulty);
  self.postMessage({ from: move.from, to: move.to, promotion: move.promotion });
};
