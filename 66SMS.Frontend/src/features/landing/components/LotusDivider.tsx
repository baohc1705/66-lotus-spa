import lotusIcon from "@/assets/icons/lotus.webp";

interface LotusDividerProps {
  dark?: boolean;
  tone?: "rose" | "gold";
  className?: string;
}

export const LotusDivider = ({
  dark = false,
  tone = "rose",
  className = "",
}: LotusDividerProps) => {
  const isGold = !dark && tone === "gold";

  const lineStyle = dark
    ? { backgroundColor: "rgba(255,255,255,0.45)" }
    : isGold
      ? { backgroundColor: "var(--gold-600)" }
      : { backgroundColor: "var(--rose-600)" };

  return (
    <div
      className={`mt-4 flex items-center justify-center gap-3 sm:mt-5 sm:gap-4 ${className}`}
      aria-hidden="true"
    >
      <span className="h-[1.5px] w-20 sm:w-32 md:w-44" style={lineStyle} />

      {dark ? (
        <img
          src={lotusIcon}
          alt=""
          className="h-5 w-5 shrink-0 object-contain brightness-0 invert sm:h-6 sm:w-6"
        />
      ) : (
        <span
          className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
          style={{
            backgroundColor: isGold ? "var(--gold-600)" : "var(--rose-600)",
            WebkitMaskImage: `url(${lotusIcon})`,
            maskImage: `url(${lotusIcon})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      )}

      <span className="h-[1.5px] w-20 sm:w-32 md:w-44" style={lineStyle} />
    </div>
  );
};
