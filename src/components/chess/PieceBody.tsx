import type { PieceSymbol } from "chess.js";

/** Original rounded vector pieces inspired by illustrated learning chess sets. */
export function BoardPiece({ type, color }: { type: PieceSymbol; color: "w" | "b" }) {
  const white = color === "w";
  const body = white ? "#fff7e8" : "#46525f";
  const edge = white ? "#657681" : "#a0afb8";
  const shade = white ? "#d6dfe0" : "#2b3541";
  const light = white ? "#ffffff" : "#758490";
  return (
    <svg viewBox="0 0 100 100" className="h-[90%] w-[90%]" aria-hidden="true">
      <ellipse cx="50" cy="90" rx={type === "p" ? 23 : 31} ry="5" fill="#101d2a" opacity=".18" />
      <g stroke={edge} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {type === "p" ? (
          <>
            <path d="M40 43C39 57 27 65 27 76C27 93 73 93 73 76C73 65 61 57 60 43Z" fill={body} />
            <path d="M30 77Q50 89 70 77" fill="none" stroke={shade} strokeWidth="7" />
            <circle cx="50" cy="31" r="18" fill={body} />
            <ellipse cx="44" cy="25" rx="6" ry="5" fill={light} stroke="none" />
          </>
        ) : (
          <>
            <path
              d="M31 65Q31 73 23 78Q18 82 21 87Q24 92 50 92Q76 92 79 87Q82 82 77 78Q69 73 69 65Z"
              fill={body}
            />
            <path d="M26 82Q50 88 74 82" stroke={shade} strokeWidth="6" fill="none" />
            {type === "r" && (
              <>
                <path d="M31 36H69L66 72Q50 80 34 72Z" fill={body} />
                <path
                  d="M23 17Q23 13 27 13H37V27H44V13H56V27H63V13H73Q77 13 77 17V40Q77 49 68 50H32Q23 49 23 40Z"
                  fill={body}
                />
                <path
                  d="M31 41Q50 46 69 41M38 69Q50 73 62 69"
                  stroke={shade}
                  strokeWidth="5"
                  fill="none"
                />
                <path d="M29 20V31" stroke={light} strokeWidth="4" />
              </>
            )}
            {type === "n" && (
              <>
                <path
                  d="M30 74Q32 61 47 50L39 43L29 50Q24 53 20 49L14 42Q11 38 16 34L35 20L35 10Q35 7 39 10L48 17Q61 12 70 24Q84 42 74 73Q53 80 30 74Z"
                  fill={body}
                />
                <path d="M62 26Q73 42 64 66" stroke={shade} strokeWidth="7" fill="none" />
                <path d="M23 39L30 36M40 24L35 29" stroke={edge} strokeWidth="3" fill="none" />
                <path d="M48 23Q55 21 59 25" stroke={light} strokeWidth="4" fill="none" />
              </>
            )}
            {type === "b" && (
              <>
                <path d="M41 51Q42 62 33 72Q50 79 67 72Q58 62 59 51Z" fill={body} />
                <path
                  d="M50 17C42 23 26 34 27 46C28 60 41 64 50 64C65 64 75 55 73 43L59 50L53 44L67 32Z"
                  fill={body}
                />
                <circle cx="50" cy="14" r="6" fill={body} />
                <path d="M38 38L46 29" stroke={light} strokeWidth="6" fill="none" />
                <path d="M36 54Q50 62 64 53" stroke={shade} strokeWidth="5" fill="none" />
              </>
            )}
            {type === "q" && (
              <>
                <path d="M35 49Q39 61 31 72Q50 80 69 72Q61 61 65 49Z" fill={body} />
                <path
                  d="M22 28L34 35L37 19L47 29L50 12L57 29L68 19L68 35L80 28L69 55Q50 63 31 55Z"
                  fill={body}
                />
                <path d="M34 46Q50 39 66 46" stroke={shade} strokeWidth="6" fill="none" />
                <circle cx="50" cy="66" r="5" fill={light} stroke="none" />
                <path d="M31 31L35 38" stroke={light} strokeWidth="4" fill="none" />
              </>
            )}
            {type === "k" && (
              <>
                <path d="M35 49Q39 61 31 72Q50 80 69 72Q61 61 65 49Z" fill={body} />
                <path
                  d="M50 31Q31 20 24 34Q17 47 33 58Q50 66 67 58Q83 47 76 34Q69 20 50 31Z"
                  fill={body}
                />
                <path d="M45 9H55V18H64V27H55V36H45V27H36V18H45Z" fill={body} />
                <path d="M35 51Q50 59 65 51" stroke={shade} strokeWidth="6" fill="none" />
                <path d="M29 38Q28 42 31 45" stroke={light} strokeWidth="4" fill="none" />
              </>
            )}
          </>
        )}
      </g>
    </svg>
  );
}
