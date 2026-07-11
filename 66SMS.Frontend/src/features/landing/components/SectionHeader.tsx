import { motion } from "motion/react";
import { LotusDivider } from "./LotusDivider";

interface SectionHeaderProps {
  title: string;
  /** Small script word above the serif title (lotus variant), e.g. "Về" */
  scriptLabel?: string;
  label?: string;
  description?: string;
  dark?: boolean;
  align?: "left" | "split" | "center";
  variant?: "default" | "lotus";
  dividerTone?: "rose" | "gold";
  className?: string;
  titleId?: string;
}

export const SectionHeader = ({
  title,
  scriptLabel,
  label,
  description,
  dark = false,
  align = "center",
  variant = "lotus",
  dividerTone = "rose",
  className = "",
  titleId,
}: SectionHeaderProps) => {
  const labelColor = dark ? "text-gold-100" : "text-gold-600";
  const titleColor = dark ? "text-white" : "text-ink";
  const descColor = dark ? "text-white/65" : "text-warm-600";

  if (variant === "lotus") {
    const isLeft = align === "left";
    return (
      <motion.header
        className={`${
          isLeft ? "text-center md:text-left" : "mx-auto text-center"
        } ${className}`}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 id={titleId} className="leading-[1.1]">
          {scriptLabel && (
            <span className="block font-display text-[clamp(1.25rem,2.2vw,1.6rem)] font-normal tracking-[0.04em] text-rose-800">
              {scriptLabel}
            </span>
          )}
          <span className="block font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.15] tracking-[0.02em] text-rose-800">
            {title}
          </span>
        </h2>
        <LotusDivider
          tone={dividerTone}
          className={isLeft ? "justify-center md:justify-start" : undefined}
        />
        {description && (
          <p
            className={`mt-4 font-geist text-base leading-[1.65] sm:text-[1.0625rem] ${descColor}`}
          >
            {description}
          </p>
        )}
      </motion.header>
    );
  }

  if (align === "split" && description) {
    return (
      <motion.header
        className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${className}`}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-xl text-left">
          {label && (
            <span
              className={`mb-2 block font-geist text-xs font-medium uppercase tracking-[0.16em] ${labelColor}`}
            >
              {label}
            </span>
          )}
          <h2
            id={titleId}
            className={`font-geist text-balance text-[clamp(1.5rem,2.6vw,2.15rem)] font-semibold leading-[1.15] tracking-[-0.02em] ${titleColor}`}
          >
            {title}
          </h2>
        </div>
        <p className={`max-w-md font-geist text-sm leading-[1.65] ${descColor}`}>
          {description}
        </p>
      </motion.header>
    );
  }

  if (align === "left") {
    return (
      <motion.header
        className={`max-w-2xl text-left ${className}`}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4 }}
      >
        {label && (
          <span
            className={`mb-2 block font-geist text-xs font-medium uppercase tracking-[0.16em] ${labelColor}`}
          >
            {label}
          </span>
        )}
        <h2
          id={titleId}
          className={`font-geist text-balance text-[clamp(1.5rem,2.6vw,2.15rem)] font-semibold leading-[1.15] tracking-[-0.02em] ${titleColor}`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-3 max-w-prose font-geist text-sm leading-[1.65] ${descColor}`}>
            {description}
          </p>
        )}
      </motion.header>
    );
  }

  return (
    <motion.header
      className={`mx-auto max-w-2xl text-center ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
    >
      {label && (
        <span
          className={`mb-2 block font-geist text-xs font-medium uppercase tracking-[0.16em] ${labelColor}`}
        >
          {label}
        </span>
      )}
      <h2
        id={titleId}
        className={`font-geist text-balance text-[clamp(1.5rem,2.6vw,2.15rem)] font-semibold leading-[1.15] tracking-[-0.02em] ${titleColor}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mx-auto mt-3 max-w-lg font-geist text-sm leading-[1.65] ${descColor}`}
        >
          {description}
        </p>
      )}
    </motion.header>
  );
};
