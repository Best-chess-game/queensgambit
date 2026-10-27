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
  const top = c.shape === "tall" ? 6 : c.shape === "wide" ? 22 : 12;
  const body =
    c.shape === "tall" ? (
      <path d="M50 6 C74 6 84 34 84 62 C84 86 70 95 50 95 C30 95 16 86 16 62 C16 34 26 6 50 6Z" />
    ) : c.shape === "wide" ? (
      <path d="M50 22 C80 22 94 42 94 62 C94 84 76 94 50 94 C24 94 6 84 6 62 C6 42 20 22 50 22Z" />
    ) : (
      <path d="M50 12 C75 12 88 34 88 58 C88 82 72 94 50 94 C28 94 12 82 12 58 C12 34 25 12 50 12Z" />
    );
  const anim = mood === "happy" ? "anim-happy" : mood === "sad" ? "anim-sad" : "anim-idle";
  const pupilY = mood === "sad" ? 49 : mood === "thinking" ? 42 : 46;
  const px = mood === "thinking" ? 3 : 0;
  const eyeR = L.eyes === 1 ? 12 : 10.5;

  return (
    <div key={animKey} className={anim} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} overflow="visible">
        <defs>
          <clipPath id={clip}>{body}</clipPath>
        </defs>
        <ellipse cx="50" cy="97" rx="30" ry="3" fill="currentColor" opacity="0.12" />
        {/* long hair sits behind the body */}
        {L.hair === 3 && <path d={`M18 ${top + 30} Q50 ${top - 18} 82 ${top + 30} L86 78 L14 78Z`} fill={HAIR} />}
        {/* feet */}
        <g fill="var(--foreground)" opacity="0.22">
          <ellipse cx="37" cy="93" rx="8" ry="3.5" />
          <ellipse cx="63" cy="93" rx="8" ry="3.5" />
        </g>
        <g fill={color}>{body}</g>
        {/* belly */}
        <ellipse cx="50" cy="72" rx="22" ry="17" fill="var(--card)" opacity="0.35" />
        {/* glossy highlight */}
        <ellipse cx="34" cy={top + 12} rx="10" ry="6" fill="var(--card)" opacity="0.4" transform={`rotate(-20 34 ${top + 12})`} />

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
        {L.hair === 1 && <path d={`M32 ${top + 8} L36 ${top - 6} L44 ${top + 4} L50 ${top - 8} L56 ${top + 4} L64 ${top - 6} L68 ${top + 8}Z`} fill={HAIR} />}
        {L.hair === 2 && (
          <g fill={HAIR}>
            {[32, 42, 52, 62, 70].map((x, i) => <circle key={x} cx={x} cy={top + (i % 2 ? 0 : 3)} r="7" />)}
          </g>
        )}
        {L.hair === 3 && <path d={`M24 ${top + 22} Q50 ${top - 12} 76 ${top + 22} Q60 ${top + 8} 50 ${top + 14} Q40 ${top + 8} 24 ${top + 22}Z`} fill={HAIR} />}
        {L.hair === 4 && <rect x="44" y={top - 12} width="12" height="22" rx="6" fill="var(--destructive)" />}

        {/* cheeks */}
        {mood === "happy" && (
          <>
            <circle cx="24" cy="58" r="5" fill="var(--destructive)" opacity="0.3" />
            <circle cx="76" cy="58" r="5" fill="var(--destructive)" opacity="0.3" />
          </>
        )}
        {/* eyes */}
        {mood === "happy" ? (
          <g stroke="var(--foreground)" strokeWidth="4.5" fill="none" strokeLinecap="round">
            <path d="M31 46 Q37 38 43 46" />
            <path d="M57 46 Q63 38 69 46" />
          </g>
        ) : (
          <g>
            <circle cx="37" cy="45" r={eyeR} fill="var(--card)" />
            <circle cx="63" cy="45" r={eyeR} fill="var(--card)" />
            <circle cx={37 + px} cy={pupilY} r="5" fill="var(--foreground)" />
            <circle cx={63 + px} cy={pupilY} r="5" fill="var(--foreground)" />
            <g fill="var(--card)">
              <circle cx={35.5 + px} cy={pupilY - 2} r="1.7" />
              <circle cx={61.5 + px} cy={pupilY - 2} r="1.7" />
            </g>
            {L.eyes === 2 && (
              <g fill={color}>
                <rect x="26" y="34" width="22" height="11" />
                <rect x="52" y="34" width="22" height="11" />
              </g>
            )}
            {mood === "sad" && (
              <g stroke="var(--foreground)" strokeWidth="3.5" strokeLinecap="round">
                <path d="M28 32 L43 36" />
                <path d="M72 32 L57 36" />
              </g>
            )}
          </g>
        )}
        {L.eyes === 3 && (
          <g stroke="var(--foreground)" strokeWidth="3" fill="none">
            <circle cx="37" cy="45" r="12" />
            <circle cx="63" cy="45" r="12" />
            <path d="M49 45 L51 45 M25 43 L16 40 M75 43 L84 40" />
          </g>
        )}
        {/* mouth */}
        {mood === "happy" && <path d="M38 62 Q50 78 62 62 Z" fill="var(--foreground)" />}
        {mood === "sad" && (
          <>
            <path d="M39 70 Q50 60 61 70" stroke="var(--foreground)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M27 56 q-3 7 0 10 q3 -3 0 -10z" fill="var(--secondary)" />
          </>
        )}
        {mood === "neutral" && <path d="M41 64 Q50 69 59 64" stroke="var(--foreground)" strokeWidth="4" fill="none" strokeLinecap="round" />}
        {mood === "thinking" && <path d="M43 66 L57 64" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round" />}

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
