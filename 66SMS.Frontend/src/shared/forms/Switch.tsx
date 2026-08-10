type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
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
          (checked ? "bg-kit-primary" : "bg-kit-track")
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
