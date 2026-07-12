import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "bg-white text-[var(--spa-text)]",
            "border border-[var(--spa-border)]",
            "rounded-xl shadow-lg",
            "font-['Be_Vietnam_Pro',sans-serif]",
          ].join(" "),
          title: "font-semibold text-sm text-[var(--spa-text)]",
          description: "text-xs text-[var(--spa-text-muted)] mt-0.5",
          actionButton: [
            "bg-[var(--spa-rose)] text-white text-xs font-semibold",
            "rounded-lg px-3 py-1.5",
            "hover:bg-[var(--spa-rose-hover)]",
          ].join(" "),
          cancelButton: [
            "bg-[var(--spa-blush)] text-[var(--spa-rose)] text-xs font-semibold",
            "rounded-lg px-3 py-1.5",
          ].join(" "),
          success: "border-l-4 border-l-[var(--spa-rose)]",
          error: "border-l-4 border-l-state-danger-solid",
          warning: "border-l-4 border-l-state-warning-solid",
          info: "border-l-4 border-l-[var(--spa-admin-primary)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
