import { useState, useRef, useEffect } from 'react'
import { Popover } from 'radix-ui'
import { ChevronDownIcon, CheckIcon, SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md bg-stone-100/80 px-3 py-2 text-[13px] whitespace-nowrap select-none text-lotus-deep outline-none transition-all duration-200 hover:bg-stone-100 focus:bg-white focus:ring-2 focus:ring-lotus-leaf/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-lotus-stone',
            className,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDownIcon className="size-4 text-lotus-stone shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] bg-white rounded-md shadow-md border border-stone-100 overflow-hidden animate-in fade-in-0 zoom-in-95"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100">
            <SearchIcon className="size-3.5 text-lotus-stone shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-[13px] text-lotus-deep bg-transparent outline-none placeholder:text-lotus-stone"
            />
          </div>

          {/* Options list */}
          <div
            className="max-h-52 overflow-y-auto p-1"
            onWheel={e => e.stopPropagation()}
          >
            {filtered.length === 0 ? (
              <p className="py-2 px-3 text-[13px] text-lotus-stone text-center">Không tìm thấy</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                  className="relative flex w-full items-center gap-2 rounded-sm py-2 pl-3 pr-8 text-[13px] text-lotus-deep text-left hover:bg-lotus-cream/50 outline-none"
                >
                  {opt.value === value && (
                    <span className="absolute right-2 flex size-4 items-center justify-center text-lotus-leaf">
                      <CheckIcon className="size-4" />
                    </span>
                  )}
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
