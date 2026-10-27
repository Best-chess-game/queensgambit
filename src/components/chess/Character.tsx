import { CHARACTERS } from "@/lib/chess-settings";

export type Mood = "neutral" | "happy" | "sad" | "thinking";

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
  const body =
    c.shape === "tall" ? (
      <path d="M50 8 C78 8 86 40 86 70 C86 90 70 96 50 96 C30 96 14 90 14 70 C14 40 22 8 50 8Z" />
    ) : c.shape === "wide" ? (
      <ellipse cx="50" cy="60" rx="44" ry="36" />
    ) : (
      <circle cx="50" cy="56" r="40" />
    );
  const anim = mood === "happy" ? "anim-happy" : mood === "sad" ? "anim-sad" : "anim-idle";
  const pupilY = mood === "sad" ? 50 : mood === "thinking" ? 43 : 48;
  const px = mood === "thinking" ? 3 : 0;

  return (
    <div key={animKey} className={anim} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} overflow="visible">
        <ellipse cx="50" cy="97" rx="30" ry="3" fill="currentColor" opacity="0.12" />
        <g fill={c.color}>{body}</g>
        <ellipse cx="38" cy="78" rx="14" ry="6" fill="var(--card)" opacity="0.25" />

        {/* cheeks */}
        {mood === "happy" && (
          <>
            <circle cx="26" cy="62" r="6" fill="var(--destructive)" opacity="0.35" />
            <circle cx="74" cy="62" r="6" fill="var(--destructive)" opacity="0.35" />
          </>
        )}
        {/* eyes */}
        {mood === "happy" ? (
          <g stroke="var(--foreground)" strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M30 48 Q37 38 44 48" />
            <path d="M56 48 Q63 38 70 48" />
          </g>
        ) : (
          <g>
            <circle cx="37" cy="47" r="10" fill="var(--card)" />
            <circle cx="63" cy="47" r="10" fill="var(--card)" />
            <circle cx={37 + px} cy={pupilY} r="5" fill="var(--foreground)" />
            <circle cx={63 + px} cy={pupilY} r="5" fill="var(--foreground)" />
            {mood === "sad" && (
              <g stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round">
                <path d="M27 34 L44 38" />
                <path d="M73 34 L56 38" />
              </g>
            )}
          </g>
        )}
        {/* mouth */}
        {mood === "happy" && <path d="M36 64 Q50 82 64 64 Z" fill="var(--foreground)" />}
        {mood === "sad" && (
          <>
            <path d="M38 74 Q50 62 62 74" stroke="var(--foreground)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M28 58 q-3 7 0 10 q3 -3 0 -10z" fill="var(--secondary)" />
          </>
        )}
        {mood === "neutral" && <path d="M40 67 Q50 73 60 67" stroke="var(--foreground)" strokeWidth="4.5" fill="none" strokeLinecap="round" />}
        {mood === "thinking" && <path d="M42 69 L58 67" stroke="var(--foreground)" strokeWidth="4.5" strokeLinecap="round" />}
      </svg>
    </div>
  );
}
