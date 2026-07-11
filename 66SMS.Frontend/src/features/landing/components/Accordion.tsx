import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItem {
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
}

export const Accordion = ({ items }: AccordionProps) => {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          className="border-b border-warm-100/20"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className={`w-full py-4 text-left bg-transparent border-none cursor-pointer flex items-center justify-between font-sans text-base font-medium text-ink`}
          >
            <span>{item.title}</span>
            <ChevronDown
                className={`w-5 h-5 text-warm-600 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`.trim()}
            />
          </button>
          <div
              className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}
