import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"


function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={`relative flex shrink-0 rounded-full select-none overflow-hidden border-2 border-[var(--spa-rose-light)] ${size === "sm" ? "size-8" : ""} ${size === "default" ? "size-10" : ""} ${size === "lg" ? "size-12" : ""} ${className || ''}`.trim()}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={`aspect-square size-full object-cover ${className || ''}`.trim()}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={`flex size-full items-center justify-center rounded-full bg-[var(--spa-blush)] text-[var(--spa-rose)] text-sm font-semibold ${className || ''}`.trim()}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
