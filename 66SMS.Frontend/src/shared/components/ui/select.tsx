import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from "lucide-react"


function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={`p-1 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-sm whitespace-nowrap select-none text-[var(--spa-text)] border-gray-200 hover:border-gray-300 data-placeholder:text-[var(--spa-text-muted)] outline-none transition-all duration-200 focus:border-[var(--spa-rose)] focus:ring-3 focus:ring-pink-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--spa-error)] aria-invalid:ring-3 aria-invalid:ring-red-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 ${className || ''}`.trim()}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 text-[var(--spa-text-muted)] shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={`relative z-50 min-w-[8rem] max-h-[--radix-select-content-available-height] origin-[--radix-select-content-transform-origin] overflow-x-hidden overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-xl text-[var(--spa-text)] duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 ${position === "popper" ? "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 *:data-[slot=select-viewport]:h-[--radix-select-trigger-height] *:data-[slot=select-viewport]:w-full *:data-[slot=select-viewport]:min-w-[--radix-select-trigger-width]" : ""} ${className || ''}`.trim()}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport data-slot="select-viewport" className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={`px-2 py-1 text-[10px] font-bold text-[var(--spa-text-muted)] uppercase tracking-wider ${className || ''}`.trim()}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={`relative flex w-full cursor-default select-none items-center gap-2 rounded-lg py-2 pl-3 pr-8 text-sm outline-none text-[var(--spa-text)] focus:bg-[var(--spa-blush)] focus:text-[var(--spa-rose)] data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${className || ''}`.trim()}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-[var(--spa-rose)]">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={`-mx-1 my-1 h-px bg-[var(--spa-border)] ${className || ''}`.trim()}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={`z-10 flex cursor-default items-center justify-center py-1 bg-white text-[var(--spa-text-muted)] ${className || ''}`.trim()}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={`z-10 flex cursor-default items-center justify-center py-1 bg-white text-[var(--spa-text-muted)] ${className || ''}`.trim()}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
