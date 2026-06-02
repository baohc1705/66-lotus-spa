import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={`fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={`fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc(100%-2rem)] sm:max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-8 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 ${className || ''}`.trim()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 text-[var(--spa-text-muted)] hover:text-[var(--spa-text)]"
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={`flex flex-col gap-1 border-b border-[var(--spa-border)] pb-4 mb-6 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 mt-6 border-t border-gray-100 ${className || ''}`.trim()}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Đóng</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={`text-xl font-bold text-[var(--spa-text)] leading-none ${className || ''}`.trim()}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={`text-sm text-[var(--spa-text-muted)] ${className || ''}`.trim()}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
