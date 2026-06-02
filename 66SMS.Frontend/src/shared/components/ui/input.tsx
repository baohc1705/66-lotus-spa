import * as React from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={`w-full min-w-0 rounded-xl border bg-white px-4 py-3 text-sm text-[var(--spa-text)] placeholder:text-[var(--spa-text-muted)] outline-none transition-all duration-200 border-gray-200 hover:border-gray-300 focus:border-[var(--spa-rose)] focus:ring-3 focus:ring-pink-100 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--spa-text)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 aria-invalid:border-[var(--spa-error)] aria-invalid:ring-3 aria-invalid:ring-red-100 [.admin-context_&]:focus:border-[var(--spa-admin-primary)] [.admin-context_&]:focus:ring-blue-100 ${className || ''}`.trim()}
      {...props}
    />
  )
}

export { Input }
