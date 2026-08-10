import { useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export type AccordionTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
  wrapper?: boolean;
  defaultOpenId?: string;
  tone?: AccordionTone;
};

function toneText(tone: AccordionTone): string {
  if (tone === "secondary") return "text-kit-secondary";
  if (tone === "success") return "text-kit-success";
  if (tone === "info") return "text-kit-info";
  if (tone === "warning") return "text-kit-warning";
  if (tone === "danger") return "text-kit-danger";
  if (tone === "focus") return "text-kit-focus";
  if (tone === "alternate") return "text-kit-alt";
  if (tone === "dark") return "text-kit-dark";
  return "text-kit-primary";
}

export function Accordion({
  items,
  className = "",
  allowMultiple = false,
  wrapper = false,
  defaultOpenId,
  tone = "primary",
}: AccordionProps) {
  const initial = defaultOpenId ?? items[0]?.id;
  const [openIds, setOpenIds] = useState<string[]>(initial ? [initial] : []);
  const linkTone = toneText(tone);

  function toggle(id: string) {
    setOpenIds((prev: string[]) => {
      const isOpen = prev.includes(id);
      if (allowMultiple) {
        return isOpen ? prev.filter((x: string) => x !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  }

  if (wrapper) {
    return (
      <div
        id="accordion"
        className={
          "accordion-wrapper mb-3 overflow-hidden rounded border border-kit " + className
        }
      >
        {items.map((item: AccordionItem) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div key={item.id} className="card border-0 bg-kit-white shadow-none">
              <div className="card-header h-auto border-0 p-4">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={
                    "btn btn-link m-0 w-full p-0 text-left text-sm font-medium no-underline hover:no-underline " +
                    linkTone
                  }
                  aria-expanded={isOpen}
                >
                  <h5 className="m-0 p-0 text-sm font-normal normal-case text-inherit">
                    {item.title}
                  </h5>
                </button>
              </div>
              {isOpen ? (
                <div className="collapse show border-b border-kit">
                  <div className="card-body p-4 pt-0 text-sm text-kit-body">{item.content}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={"font-sans text-sm " + className} data-children=".item">
      {items.map((item: AccordionItem) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="item mb-1">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={
                "btn btn-link m-0 block p-0 text-left text-sm font-medium " + linkTone
              }
              aria-expanded={isOpen}
            >
              {item.title}
            </button>
            {isOpen ? (
              <div className="collapse show">
                <p className="mb-3 text-sm text-kit-body">{item.content}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type CollapseProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

export function Collapse({ open, children, className = "" }: CollapseProps) {
  if (!open) return null;
  return <div className={"collapse show text-sm text-kit-body " + className}>{children}</div>;
}
