import type { PieceSymbol } from "chess.js";

/** A consistent Staunton-style vector set for both sides. */
export function BoardPiece({ type, color }: { type: PieceSymbol; color: "w" | "b" }) {
  const white = color === "w";
  const fill = white ? "#f8f8f8" : "#353535";
  const line = white ? "#363636" : "#111111";
  const detail = white ? "#777777" : "#929292";
  return (
    <svg viewBox="0 0 100 100" className="h-[90%] w-[90%]" aria-hidden="true">
      <g fill={fill} stroke={line} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        {type === "p" && (
          <>
            <path d="M35 72Q43 57 39 49Q28 42 34 32Q37 26 43 25Q36 11 50 10Q64 11 57 25Q68 28 68 38Q68 45 61 49Q57 57 65 72Z" />
            <path d="M32 72H68L75 83H25Z" />
          </>
        )}
        {type === "r" && (
          <>
            <path d="M25 17H36V29H44V17H56V29H64V17H75V39L66 47V71H34V47L25 39Z" />
            <path d="M30 72H70L76 83H24Z" />
            <path d="M31 40H69M35 48H65" fill="none" stroke={detail} />
          </>
        )}
        {type === "b" && (
          <>
            <circle cx="50" cy="12" r="5" />
            <path d="M50 18Q24 34 32 47Q36 54 43 55Q42 64 34 73H66Q58 64 57 55Q68 52 70 43Q72 33 50 18Z" />
            <path d="M52 27L61 40M37 54H63" fill="none" stroke={detail} strokeWidth="3" />
            <path d="M29 73Q50 66 71 73L77 83H23Z" />
          </>
        )}
        {type === "n" && (
          <>
            <path d="M28 76Q31 62 49 51L39 44L29 51L17 43L21 34L39 20L40 9L51 17L62 14Q83 30 77 76Z" />
            <path
              d="M62 24Q74 46 63 67M24 41L31 40M44 24L39 29"
              fill="none"
              stroke={detail}
              strokeWidth="3"
            />
            <path d="M28 76H75L80 83H23Z" />
          </>
        )}
        {type === "q" && (
          <>
            <path d="M22 27L34 40L39 23L50 39L61 23L66 40L78 27L68 59H32Z" />
            <g>
              <circle cx="21" cy="22" r="5" />
              <circle cx="38" cy="18" r="5" />
              <circle cx="50" cy="12" r="5" />
              <circle cx="62" cy="18" r="5" />
              <circle cx="79" cy="22" r="5" />
            </g>
            <path d="M33 59H67L63 68L73 80H27L37 68Z" />
            <path d="M35 63H65M34 74H66" stroke={detail} fill="none" />
          </>
        )}
        {type === "k" && (
          <>
            <path d="M46 7H54V15H62V22H54V32H46V22H38V15H46Z" />
            <path d="M50 36Q34 23 25 36Q19 46 34 58L38 67L29 80H71L62 67L66 58Q81 46 75 36Q66 23 50 36Z" />
            <path d="M50 37V56M35 58H65M38 67H62M34 74H66" fill="none" stroke={detail} />
          </>
        )}
        <path d="M25 83H75L80 91H20Z" />
        <path d="M28 86H72" fill="none" stroke={detail} strokeWidth="1.5" />
      </g>
    </svg>
  );
}
