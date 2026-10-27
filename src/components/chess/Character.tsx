import { CHARACTERS } from "@/lib/chess-settings";

export type Mood = "neutral" | "happy" | "sad" | "thinking";

const INK = "var(--char-ink)";
const CREAM = "var(--char-cream)";

function Body({ id }: { id: string }) {
  switch (id) {
    case "owl":
      return (
        <g>
          <path d="M22 30 L28 6 L42 24Z M78 30 L72 6 L58 24Z" fill="var(--char-owl)" />
          <ellipse cx="50" cy="58" rx="38" ry="38" fill="var(--char-owl)" />
          <ellipse cx="50" cy="74" rx="22" ry="20" fill={CREAM} />
          <path d="M38 72 q4 4 8 0 M54 72 q4 4 8 0 M46 82 q4 4 8 0" stroke="var(--char-owl)" strokeWidth="2.5" fill="none" />
          <circle cx="37" cy="47" r="14" fill={CREAM} />
          <circle cx="63" cy="47" r="14" fill={CREAM} />
          <path d="M45 56 L55 56 L50 64Z" fill="var(--char-beak)" />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M16 40 L20 6 L44 26Z M84 40 L80 6 L56 26Z" fill="var(--char-cat)" />
          <path d="M22 30 L23 14 L36 26Z M78 30 L77 14 L64 26Z" fill="var(--destructive)" opacity="0.35" />
          <ellipse cx="50" cy="58" rx="40" ry="36" fill="var(--char-cat)" />
          <ellipse cx="50" cy="68" rx="16" ry="11" fill={CREAM} />
          <path d="M46 60 L54 60 L50 64Z" fill="var(--destructive)" opacity="0.7" />
          <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" opacity="0.6">
            <path d="M30 64 L10 60 M30 68 L10 70 M70 64 L90 60 M70 68 L90 70" />
          </g>
        </g>
      );
    case "frog":
      return (
        <g>
          <circle cx="32" cy="30" r="17" fill="var(--char-frog)" />
          <circle cx="68" cy="30" r="17" fill="var(--char-frog)" />
          <ellipse cx="50" cy="64" rx="44" ry="32" fill="var(--char-frog)" />
          <ellipse cx="50" cy="80" rx="26" ry="12" fill={CREAM} opacity="0.7" />
          <circle cx="24" cy="66" r="3" fill={INK} opacity="0.15" />
          <circle cx="78" cy="70" r="4" fill={INK} opacity="0.15" />
        </g>
      );
    case "panda":
      return (
        <g>
          <circle cx="20" cy="22" r="13" fill={INK} />
          <circle cx="80" cy="22" r="13" fill={INK} />
          <circle cx="50" cy="56" r="40" fill="var(--char-panda)" stroke={INK} strokeOpacity="0.15" strokeWidth="2" />
          <ellipse cx="36" cy="48" rx="13" ry="15" fill={INK} transform="rotate(-20 36 48)" />
          <ellipse cx="64" cy="48" rx="13" ry="15" fill={INK} transform="rotate(20 64 48)" />
          <ellipse cx="50" cy="62" rx="6" ry="4" fill={INK} />
        </g>
      );
    case "robot":
      return (
        <g>
          <line x1="50" y1="18" x2="50" y2="6" stroke={INK} strokeWidth="4" />
          <circle cx="50" cy="6" r="6" fill="var(--destructive)" className="anim-blink" />
          <rect x="6" y="44" width="10" height="22" rx="4" fill={INK} opacity="0.7" />
          <rect x="84" y="44" width="10" height="22" rx="4" fill={INK} opacity="0.7" />
          <rect x="14" y="18" width="72" height="76" rx="18" fill="var(--char-robot)" />
          <rect x="22" y="30" width="56" height="34" rx="12" fill={INK} opacity="0.85" />
          <g fill={CREAM} opacity="0.6">
            <circle cx="34" cy="82" r="3" /><circle cx="46" cy="82" r="3" /><circle cx="58" cy="82" r="3" />
          </g>
        </g>
      );
    default: // fox
      return (
        <g>
          <path d="M14 46 L18 4 L46 28Z M86 46 L82 4 L54 28Z" fill="var(--char-fox)" />
          <path d="M20 34 L21 14 L36 28Z M80 34 L79 14 L64 28Z" fill={INK} opacity="0.7" />
          <ellipse cx="50" cy="58" rx="40" ry="36" fill="var(--char-fox)" />
          <path d="M12 60 Q30 58 50 94 Q70 58 88 60 Q86 92 50 94 Q14 92 12 60Z" fill={CREAM} />
          <ellipse cx="50" cy="62" rx="6" ry="4.5" fill={INK} />
        </g>
      );
  }
}

export function Character({
  id,
  mood,
  size = 96,
  animKey = 0,
}: {
  id: string;
  mood: Mood;
  size?: number;
  animKey?: number;
}) {
  const c = CHARACTERS.find((x) => x.id === id) ?? CHARACTERS[0];
  const anim = mood === "happy" ? "anim-happy" : mood === "sad" ? "anim-sad" : "anim-idle";
  const robot = c.id === "robot";
  const eyeY = c.id === "frog" ? 30 : 47;
  const eyeX: [number, number] = c.id === "frog" ? [32, 68] : [37, 63];
  const pupilY = eyeY + (mood === "sad" ? 3 : mood === "thinking" ? -4 : 1);
  const px = mood === "thinking" ? 3 : 0;
  const pupil = robot ? "var(--char-robot)" : c.id === "panda" ? CREAM : INK;
  const mouthY = c.id === "frog" ? 64 : c.id === "robot" ? 56 : 70;
  const eyeWhite = c.id === "panda" ? INK : robot ? "transparent" : "var(--card)";

  return (
    <div key={animKey} className={anim} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} overflow="visible">
        <ellipse cx="50" cy="98" rx="32" ry="3" fill="currentColor" opacity="0.12" />
        <Body id={c.id} />

        {mood === "happy" && (
          <>
            <circle cx="22" cy={mouthY - 6} r="6" fill="var(--destructive)" opacity="0.35" />
            <circle cx="78" cy={mouthY - 6} r="6" fill="var(--destructive)" opacity="0.35" />
          </>
        )}

        {mood === "happy" ? (
          <g stroke={robot ? "var(--char-robot)" : c.id === "panda" ? CREAM : INK} strokeWidth="5" fill="none" strokeLinecap="round">
            <path d={`M${eyeX[0] - 7} ${eyeY + 1} Q${eyeX[0]} ${eyeY - 9} ${eyeX[0] + 7} ${eyeY + 1}`} />
            <path d={`M${eyeX[1] - 7} ${eyeY + 1} Q${eyeX[1]} ${eyeY - 9} ${eyeX[1] + 7} ${eyeY + 1}`} />
          </g>
        ) : (
          <g>
            <circle cx={eyeX[0]} cy={eyeY} r="9" fill={eyeWhite} />
            <circle cx={eyeX[1]} cy={eyeY} r="9" fill={eyeWhite} />
            <circle cx={eyeX[0] + px} cy={pupilY} r={robot ? 6 : 5} fill={pupil} />
            <circle cx={eyeX[1] + px} cy={pupilY} r={robot ? 6 : 5} fill={pupil} />
            {!robot && <circle cx={eyeX[0] + px + 2} cy={pupilY - 2} r="1.6" fill="var(--card)" />}
            {!robot && <circle cx={eyeX[1] + px + 2} cy={pupilY - 2} r="1.6" fill="var(--card)" />}
            {mood === "sad" && (
              <g stroke={c.id === "panda" || robot ? CREAM : INK} strokeWidth="4" strokeLinecap="round">
                <path d={`M${eyeX[0] - 10} ${eyeY - 13} L${eyeX[0] + 7} ${eyeY - 9}`} />
                <path d={`M${eyeX[1] + 10} ${eyeY - 13} L${eyeX[1] - 7} ${eyeY - 9}`} />
              </g>
            )}
          </g>
        )}

        {(() => {
          const m = robot ? "var(--char-robot)" : INK;
          const y = mouthY;
          if (mood === "happy") return <path d={`M38 ${y - 2} Q50 ${y + 14} 62 ${y - 2} Z`} fill={m} />;
          if (mood === "sad")
            return (
              <>
                <path d={`M40 ${y + 6} Q50 ${y - 4} 60 ${y + 6}`} stroke={m} strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d={`M${eyeX[0] - 6} ${eyeY + 10} q-3 7 0 10 q3 -3 0 -10z`} fill="var(--secondary)" />
              </>
            );
          if (mood === "thinking") return <path d={`M43 ${y + 2} L57 ${y}`} stroke={m} strokeWidth="4" strokeLinecap="round" />;
          return <path d={`M42 ${y} Q50 ${y + 6} 58 ${y}`} stroke={m} strokeWidth="4" fill="none" strokeLinecap="round" />;
        })()}
      </svg>
    </div>
  );
}
