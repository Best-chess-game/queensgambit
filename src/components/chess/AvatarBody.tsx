/** Original character portraits, separate from the chess-piece artwork. */
export function AvatarBody({ id }: { id: string }) {
  const skin =
    id === "ember"
      ? "#b96c42"
      : id === "bloop"
        ? "#e9ad81"
        : id === "sunny"
          ? "#825039"
          : "#f4bf91";
  const shirt =
    id === "ember"
      ? "#ff7459"
      : id === "bloop"
        ? "#a986e8"
        : id === "sunny"
          ? "#ffc83d"
          : "#78c83a";
  return (
    <>
      <path d="M15 96V88Q16 74 35 74H65Q84 74 85 88V96Z" fill={shirt} />
      <path d="M40 72H60V80Q50 89 40 80Z" fill={skin} />
      <path
        d="M39 75L50 83L61 75"
        fill="none"
        stroke="#fff"
        strokeOpacity=".5"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {id === "bloop" && <path d="M15 77V33Q15 7 50 7Q85 7 85 33V77L70 84H30Z" fill="#593d83" />}
      <g fill={skin}>
        <circle cx="20" cy="49" r="9" />
        <circle cx="80" cy="49" r="9" />
        <rect x="21" y="18" width="58" height="61" rx="27" />
      </g>
      {id === "pip" && (
        <>
          <path
            d="M20 42V28Q19 9 42 9L51 3L56 10Q81 6 81 33L78 42L69 25Q52 34 32 26L24 42Z"
            fill="#754530"
          />
          <path
            d="M33 15Q43 12 49 14"
            stroke="#a86b40"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {id === "ember" && (
        <>
          <g fill="#322b40">
            <circle cx="26" cy="23" r="13" />
            <circle cx="43" cy="16" r="14" />
            <circle cx="62" cy="17" r="14" />
            <circle cx="77" cy="27" r="12" />
          </g>
          <path
            d="M23 29Q49 15 78 31"
            fill="none"
            stroke="#ffca45"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "bloop" && (
        <path d="M19 39Q16 9 48 10Q80 9 81 39L71 33L62 23L57 34L29 30L23 41Z" fill="#593d83" />
      )}
      {id === "sunny" && (
        <>
          <path d="M21 40Q16 10 48 10Q83 8 80 40L71 28L30 29Z" fill="#292c36" />
          <path d="M17 26Q17 4 49 4Q77 4 82 27Z" fill="#20b8ae" />
          <rect x="12" y="23" width="76" height="10" rx="5" fill="#128d8b" />
        </>
      )}
      <ellipse cx="29" cy="62" rx="6" ry="3" fill="#ec7c72" opacity=".5" />
      <ellipse cx="71" cy="62" rx="6" ry="3" fill="#ec7c72" opacity=".5" />
    </>
  );
}
