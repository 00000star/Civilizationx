type CodexLogoProps = {
  isSpace: boolean;
  className?: string;
};

export function CodexLogo({ isSpace, className = "" }: CodexLogoProps) {
  const accent = isSpace ? "#00D4FF" : "#C9A84C";
  const glow = isSpace ? "rgba(0, 212, 255, 0.22)" : "rgba(201, 168, 76, 0.2)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <svg
        aria-hidden
        viewBox="0 0 56 56"
        className="h-10 w-10 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="52" height="52" rx="14" fill="#0A0A0F" />
        <rect x="2" y="2" width="52" height="52" rx="14" stroke={accent} strokeOpacity="0.35" />
        <path
          d="M16 18.5L28 13L40 18.5V35.5L28 43L16 35.5V18.5Z"
          fill={glow}
          stroke={accent}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M22 24H34M22 29H34M22 34H30"
          stroke={accent}
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d="M28 13V43"
          stroke={accent}
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={isSpace ? "text-codex-space" : "text-codex-text"}>The Codex</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.32em] text-codex-muted">
          Starking Archive
        </span>
      </span>
    </span>
  );
}
