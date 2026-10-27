import { useId } from "react";
import { CHARACTERS, LOOK_COLORS, parseLook } from "@/lib/chess-settings";

export type Mood = "neutral" | "happy" | "sad" | "thinking";

const HAIR = "oklch(0.35 0.06 50)";

/** `id` may be a plain character id ("pip") or include a look ("pip:21300"). */
export function Character({
  id,
  mood,
  size = 96,
  animKey = 0,
  look,
}: {
  id: string;
  mood: Mood;
  size?: number;
  animKey?: number;
  look?: string;
}) {
  const [baseId, codeLook] = id.split(":");
  const L = parseLook(look ?? codeLook);
  const clip = useId().replace(/:/g, "");
  const c = CHARACTERS.find((x) => x.id === baseId) ?? CHARACTERS[0];
  const color = LOOK_COLORS[L.color] || c.color;
  const top = c.shape === "tall" ? 8 : c.shape === "wide" ? 24 : 16;
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
  const eyeR = L.eyes === 1 ? 12 : 10;

  return (
    <div key={animKey} className={anim} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} overflow="visible">
        <defs>
          <clipPath id={clip}>{body}</clipPath>
        </defs>
        <ellipse cx="50" cy="97" rx="30" ry="3" fill="currentColor" opacity="0.12" />
        {/* long hair sits behind the body */}
        {L.hair === 3 && <path d={`M18 ${top + 30} Q50 ${top - 18} 82 ${top + 30} L86 78 L14 78Z`} fill={HAIR} />}
        <g fill={color}>{body}</g>
        <ellipse cx="38" cy="78" rx="14" ry="6" fill="var(--card)" opacity="0.25" />

        {/* clothes, clipped to the body */}
        <g clipPath={`url(#${clip})`}>
          {L.clothes === 1 && <rect x="0" y="80" width="100" height="20" fill="var(--secondary)" />}
          {L.clothes === 4 && (
            <>
              <rect x="0" y="76" width="100" height="24" fill="var(--primary-shade)" />
              <path d="M44 76 L44 90 M56 76 L56 90" stroke="var(--card)" strokeWidth="2" />
            </>
          )}
          {L.clothes === 3 && <rect x="0" y="74" width="100" height="9" fill="var(--destructive)" />}
        </g>
        {L.clothes === 3 && <rect x="62" y="80" width="9" height="16" rx="3" fill="var(--destructive)" />}
        {L.clothes === 2 && (
          <g fill="var(--destructive)">
            <path d="M50 84 L38 78 L38 90Z M50 84 L62 78 L62 90Z" />
            <circle cx="50" cy="84" r="3.5" />
          </g>
        )}

        {/* hair on top */}
        {L.hair === 1 && <path d={`M28 ${top + 8} L34 ${top - 8} L42 ${top + 4} L50 ${top - 10} L58 ${top + 4} L66 ${top - 8} L72 ${top + 8}Z`} fill={HAIR} />}
        {L.hair === 2 && (
          <g fill={HAIR}>
            {[30, 40, 50, 60, 70].map((x, i) => <circle key={x} cx={x} cy={top + (i % 2 ? 0 : 4)} r="8" />)}
          </g>
        )}
        {L.hair === 3 && <path d={`M22 ${top + 22} Q50 ${top - 12} 78 ${top + 22} Q60 ${top + 8} 50 ${top + 14} Q40 ${top + 8} 22 ${top + 22}Z`} fill={HAIR} />}
        {L.hair === 4 && <rect x="44" y={top - 12} width="12" height="22" rx="6" fill="var(--destructive)" />}

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
            <circle cx="37" cy="47" r={eyeR} fill="var(--card)" />
            <circle cx="63" cy="47" r={eyeR} fill="var(--card)" />
            <circle cx={37 + px} cy={pupilY} r="5" fill="var(--foreground)" />
            <circle cx={63 + px} cy={pupilY} r="5" fill="var(--foreground)" />
            {L.eyes === 1 && (
              <g fill="var(--card)">
                <circle cx={35 + px} cy={pupilY - 2} r="1.8" />
                <circle cx={61 + px} cy={pupilY - 2} r="1.8" />
              </g>
            )}
            {L.eyes === 2 && (
              <g fill={color}>
                <rect x="26" y="36" width="22" height="11" />
                <rect x="52" y="36" width="22" height="11" />
              </g>
            )}
            {mood === "sad" && (
              <g stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round">
                <path d="M27 34 L44 38" />
                <path d="M73 34 L56 38" />
              </g>
            )}
          </g>
        )}
        {L.eyes === 3 && (
          <g stroke="var(--foreground)" strokeWidth="3" fill="none">
            <circle cx="37" cy="47" r="12" />
            <circle cx="63" cy="47" r="12" />
            <path d="M49 47 L51 47 M25 45 L16 42 M75 45 L84 42" />
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

        {/* extras */}
        {L.hat === 1 && <path d={`M32 ${top + 2} L32 ${top - 16} L41 ${top - 6} L50 ${top - 20} L59 ${top - 6} L68 ${top - 16} L68 ${top + 2}Z`} fill="var(--accent)" stroke="var(--accent-foreground)" strokeWidth="1.5" />}
        {L.hat === 2 && (
          <g fill="var(--secondary-shade)">
            <path d={`M26 ${top + 10} Q50 ${top - 22} 74 ${top + 10}Z`} />
            <rect x="60" y={top + 6} width="30" height="6" rx="3" />
          </g>
        )}
        {L.hat === 3 && (
          <g transform={`translate(74 ${top + 10})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={7 * Math.cos((a * Math.PI) / 180)} cy={7 * Math.sin((a * Math.PI) / 180)} r="5" fill="oklch(0.8 0.14 350)" />
            ))}
            <circle r="4" fill="var(--accent)" />
          </g>
        )}
        {L.hat === 4 && (
          <g>
            <path d={`M14 50 Q14 ${top - 8} 50 ${top - 8} Q86 ${top - 8} 86 50`} stroke="var(--foreground)" strokeWidth="4" fill="none" />
            <rect x="6" y="42" width="12" height="20" rx="5" fill="var(--foreground)" />
            <rect x="82" y="42" width="12" height="20" rx="5" fill="var(--foreground)" />
          </g>
        )}
      </svg>
    </div>
  );
}
