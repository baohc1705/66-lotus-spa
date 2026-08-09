export type SwitchTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  tone?: SwitchTone;
  className?: string;
};

function toneOnClass(tone: SwitchTone): string {
  if (tone === "secondary") return "bg-kit-secondary";
  if (tone === "success") return "bg-kit-success";
  if (tone === "info") return "bg-kit-info";
  if (tone === "warning") return "bg-kit-warning";
  if (tone === "danger") return "bg-kit-danger";
  if (tone === "focus") return "bg-kit-focus";
  if (tone === "alternate") return "bg-kit-alt";
  if (tone === "dark") return "bg-kit-dark";
  return "bg-kit-primary";
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  tone = "primary",
  className = "",
}: SwitchProps) {
  return (
    <label className={"inline-flex items-center gap-2 text-sm text-kit-heading " + className}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          (checked ? toneOnClass(tone) : "bg-kit-track")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 rounded-full bg-kit-white transition-transform " +
            (checked ? "translate-x-4" : "translate-x-0.5")
          }
        />
      </button>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
