import { CHARACTERS, LOOK_COLORS, parseLook } from "@/lib/chess-settings";

export type Mood = "neutral" | "happy" | "sad" | "thinking";

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
  const c = CHARACTERS.find((x) => x.id === baseId) ?? CHARACTERS[0];
  const skin = LOOK_COLORS[L.color] || c.skin;
  const shirt = L.clothes === 1 ? "var(--secondary)" : L.clothes === 4 ? "var(--primary-shade)" : c.shirt;
  const anim = mood === "happy" ? "anim-happy" : mood === "sad" ? "anim-sad" : "anim-idle";
  const pupilY = mood === "sad" ? 34 : mood === "thinking" ? 29 : 32;
  const px = mood === "thinking" ? 2 : 0;

  return (
    <div key={animKey} className={anim} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} overflow="visible">
        <ellipse cx="50" cy="97" rx="28" ry="3" fill="currentColor" opacity="0.12" />

        {/* legs */}
        <g fill="var(--foreground)" opacity="0.75">
          <rect x="39" y="86" width="8" height="10" rx="4" />
          <rect x="53" y="86" width="8" height="10" rx="4" />
        </g>

        {/* hoodie hood behind the head */}
        {L.clothes === 4 && <circle cx="50" cy="36" r="27" fill="var(--primary-shade)" />}

        {/* arms */}
        <g fill={shirt}>
          <rect x="19" y="60" width="10" height="24" rx="5" />
          <rect x="71" y="60" width="10" height="24" rx="5" />
        </g>
        <g fill={skin}>
          <circle cx="24" cy="86" r="5" />
          <circle cx="76" cy="86" r="5" />
        </g>

        {/* torso */}
        <rect x="27" y="56" width="46" height="34" rx="15" fill={shirt} />
        {L.clothes === 1 && <path d="M42 56 Q50 64 58 56" stroke="var(--card)" strokeWidth="3" fill="none" />}
        {L.clothes === 4 && (
          <g stroke="var(--card)" strokeWidth="2" strokeLinecap="round">
            <path d="M45 62 L45 72 M55 62 L55 72" />
          </g>
        )}

        {/* neck + head */}
        <rect x="44" y="48" width="12" height="12" rx="4" fill={skin} />
        <circle cx="27" cy="36" r="4" fill={skin} />
        <circle cx="73" cy="36" r="4" fill={skin} />
        <circle cx="50" cy="34" r="23" fill={skin} />

        {/* hair */}
        {L.hair === 0 && <path d="M27 32 Q25 10 50 10 Q75 10 73 32 Q66 20 58 21 Q62 15 50 15 Q36 15 34 24 Q30 26 27 32Z" fill={c.hair} />}
        {L.hair === 1 && <path d="M28 28 L32 8 L40 20 L46 4 L52 18 L60 6 L64 20 L72 12 L72 28 Q60 16 50 16 Q40 16 28 28Z" fill={c.hair} />}
        {L.hair === 2 && (
          <g fill={c.hair}>
            {[30, 38, 46, 54, 62, 70].map((x, i) => <circle key={x} cx={x} cy={16 + (i % 2) * 4} r="8" />)}
            <circle cx="28" cy="26" r="6" />
            <circle cx="72" cy="26" r="6" />
          </g>
        )}
        {L.hair === 3 && (
          <g fill={c.hair}>
            <path d="M26 34 Q22 8 50 8 Q78 8 74 34 L74 62 Q68 62 66 52 L66 30 Q58 20 50 20 Q42 20 34 30 L34 52 Q32 62 26 62Z" />
          </g>
        )}
        {L.hair === 4 && <rect x="44" y="2" width="12" height="20" rx="6" fill={c.hair} />}

        {/* cheeks */}
        {mood === "happy" && (
          <>
            <circle cx="33" cy="42" r="4" fill="var(--destructive)" opacity="0.3" />
            <circle cx="67" cy="42" r="4" fill="var(--destructive)" opacity="0.3" />
          </>
        )}

        {/* eyes */}
        {mood === "happy" ? (
          <g stroke="var(--foreground)" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M35 32 Q40 26 45 32" />
            <path d="M55 32 Q60 26 65 32" />
          </g>
        ) : (
          <g>
            <circle cx="40" cy="31" r="5.5" fill="var(--card)" />
            <circle cx="60" cy="31" r="5.5" fill="var(--card)" />
            <circle cx={40 + px} cy={pupilY} r="2.8" fill="var(--foreground)" />
            <circle cx={60 + px} cy={pupilY} r="2.8" fill="var(--foreground)" />
            <g fill="var(--card)">
              <circle cx={39 + px} cy={pupilY - 1} r="1" />
              <circle cx={59 + px} cy={pupilY - 1} r="1" />
            </g>
            {L.eyes === 2 && (
              <g fill={skin}>
                <rect x="33" y="24" width="14" height="7" />
                <rect x="53" y="24" width="14" height="7" />
              </g>
            )}
            {mood === "sad" && (
              <g stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M34 22 L45 25" />
                <path d="M66 22 L55 25" />
              </g>
            )}
          </g>
        )}
        {L.eyes === 3 && (
          <g stroke="var(--foreground)" strokeWidth="2.5" fill="none">
            <circle cx="40" cy="31" r="8" />
            <circle cx="60" cy="31" r="8" />
            <path d="M48 31 L52 31 M32 30 L26 28 M68 30 L74 28" />
          </g>
        )}

        {/* nose */}
        <circle cx="50" cy="39" r="2" fill="var(--foreground)" opacity="0.15" />

        {/* mouth */}
        {mood === "happy" && <path d="M41 44 Q50 55 59 44 Z" fill="var(--foreground)" />}
        {mood === "sad" && (
          <>
            <path d="M42 50 Q50 43 58 50" stroke="var(--foreground)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M30 40 q-2.5 6 0 8 q2.5 -2 0 -8z" fill="var(--secondary)" />
          </>
        )}
        {mood === "neutral" && <path d="M43 46 Q50 50 57 46" stroke="var(--foreground)" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {mood === "thinking" && <path d="M44 48 L56 46" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />}

        {/* bow tie / scarf */}
        {L.clothes === 2 && (
          <g fill="var(--destructive)">
            <path d="M50 58 L41 53 L41 63Z M50 58 L59 53 L59 63Z" />
            <circle cx="50" cy="58" r="3" />
          </g>
        )}
        {L.clothes === 3 && (
          <g fill="var(--destructive)">
            <rect x="34" y="52" width="32" height="8" rx="4" />
            <rect x="56" y="58" width="8" height="14" rx="3" />
          </g>
        )}

        {/* extras */}
        {L.hat === 1 && <path d="M34 14 L34 0 L41 8 L50 -4 L59 8 L66 0 L66 14Z" fill="var(--accent)" stroke="var(--accent-foreground)" strokeWidth="1.5" />}
        {L.hat === 2 && (
          <g fill="var(--secondary-shade)">
            <path d="M28 20 Q50 -6 72 20Z" />
            <rect x="58" y="16" width="26" height="5" rx="2.5" />
          </g>
        )}
        {L.hat === 3 && (
          <g transform="translate(70 14)">
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={6 * Math.cos((a * Math.PI) / 180)} cy={6 * Math.sin((a * Math.PI) / 180)} r="4" fill="oklch(0.8 0.14 350)" />
            ))}
            <circle r="3.5" fill="var(--accent)" />
          </g>
        )}
        {L.hat === 4 && (
          <g>
            <path d="M24 36 Q24 6 50 6 Q76 6 76 36" stroke="var(--foreground)" strokeWidth="4" fill="none" />
            <rect x="18" y="28" width="11" height="18" rx="5" fill="var(--foreground)" />
            <rect x="71" y="28" width="11" height="18" rx="5" fill="var(--foreground)" />
          </g>
        )}
      </svg>
    </div>
  );
}
