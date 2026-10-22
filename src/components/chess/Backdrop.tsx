import type { CSSProperties } from "react";

/**
 * Decorative wallpaper for the menu screen: a soft sky, drifting clouds,
 * distant hills and a chessboard floor receding to the horizon. The floor
 * squares reuse the player's board colours so the wallpaper matches the
 * theme picked in Settings.
 */

const CLOUDS = [
  { top: "9%", size: 1.15, dur: 95, dl: -30, o: 0.92 },
  { top: "22%", size: 0.72, dur: 135, dl: -85, o: 0.62 },
  { top: "3%", size: 1.5, dur: 170, dl: -125, o: 0.78 },
  { top: "31%", size: 0.58, dur: 115, dl: -55, o: 0.5 },
];

const PIECES = [
  { g: "♞", top: "16%", left: "6%", size: 86, dur: 8.5, dl: 0, r: "-10deg" },
  { g: "♛", top: "27%", left: "86%", size: 98, dur: 9.5, dl: 0.7, r: "12deg" },
  { g: "♜", top: "60%", left: "11%", size: 66, dur: 11, dl: 1.4, r: "8deg" },
  { g: "♝", top: "66%", left: "84%", size: 72, dur: 12, dl: 2.1, r: "-8deg" },
  { g: "♟", top: "44%", left: "2%", size: 46, dur: 7.5, dl: 1.7, r: "14deg" },
  { g: "♘", top: "6%", left: "58%", size: 58, dur: 10, dl: 2.6, r: "6deg" },
  { g: "♕", top: "74%", left: "17%", size: 54, dur: 13, dl: 0.4, r: "-14deg" },
  { g: "♟", top: "80%", left: "88%", size: 42, dur: 9, dl: 3.1, r: "10deg" },
];

export function MenuBackdrop() {
  return (
    <div aria-hidden className="wallpaper">
      <div className="wall-sky" />
      <div className="wall-sun" />

      {CLOUDS.map((c, i) => (
        <span
          key={`cloud-${i}`}
          className="wall-cloud"
          style={{
            top: c.top,
            fontSize: `${c.size}rem`,
            opacity: c.o,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.dl}s`,
          }}
        />
      ))}

      <svg className="wall-hills" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path
          d="M0 200 L0 118 Q180 34 360 108 Q520 172 700 88 Q880 18 1040 96 Q1130 132 1200 106 L1200 200Z"
          fill="var(--wall-hill-far)"
        />
        <path
          d="M0 200 L0 158 Q200 98 420 150 Q640 202 860 136 Q1040 88 1200 148 L1200 200Z"
          fill="var(--wall-hill-near)"
        />
      </svg>

      <div className="wall-floor">
        <div className="wall-board" />
      </div>

      {PIECES.map((p, i) => (
        <span
          key={`piece-${i}`}
          className="wall-piece"
          style={
            {
              top: p.top,
              left: p.left,
              fontSize: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.dl}s`,
              "--r": p.r,
            } as CSSProperties
          }
        >
          {p.g}
        </span>
      ))}

      <div className="wall-glow" />
      <div className="wall-vignette" />
    </div>
  );
}
