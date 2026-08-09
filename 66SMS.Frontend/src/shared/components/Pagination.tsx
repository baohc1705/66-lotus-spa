import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationSize = "sm" | "md" | "lg";

export type PaginationTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "dark";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  tone?: PaginationTone;
  className?: string;
};

type PageItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

function sizeTokens(size: PaginationSize) {
  if (size === "sm") {
    return {
      box: "min-w-8 h-8 px-1.5 text-sm",
      nav: "size-8",
      icon: "size-3.5",
      input: "h-8 w-10 text-sm",
    };
  }
  if (size === "lg") {
    return {
      box: "min-w-11 h-11 px-2 text-base",
      nav: "size-11",
      icon: "size-5",
      input: "h-11 w-14 text-base",
    };
  }
  return {
    box: "min-w-9 h-9 px-2 text-sm",
    nav: "size-9",
    icon: "size-4",
    input: "h-9 w-12 text-sm",
  };
}

function toneActive(tone: PaginationTone): string {
  if (tone === "secondary") return "bg-kit-secondary text-kit-white border-kit-secondary ";
  if (tone === "success") return "bg-kit-success text-kit-white border-kit-success ";
  if (tone === "info") return "bg-kit-info text-kit-white border-kit-info ";
  if (tone === "warning") return "bg-kit-warning text-kit-on-warning border-kit-warning ";
  if (tone === "danger") return "bg-kit-danger text-kit-white border-kit-danger ";
  if (tone === "focus") return "bg-kit-focus text-kit-white border-kit-focus ";
  if (tone === "alternate") return "bg-kit-alt text-kit-white border-kit-alt ";
  if (tone === "dark") return "bg-kit-dark text-kit-white border-kit-dark ";
  return "bg-kit-primary text-kit-white border-kit-primary ";
}

function toneText(tone: PaginationTone): string {
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

function clampPage(value: number, pageCount: number): number | null {
  if (!Number.isFinite(value)) return null;
  const n = Math.floor(value);
  if (n < 1 || n > pageCount) return null;
  return n;
}

/** Cua so: dau [1 2 3 ... N], giua [1 ... p-1 p p+1 ... N], cuoi doi xung */
function buildPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 0) return [];
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_: unknown, i: number) => ({
      type: "page" as const,
      page: i + 1,
    }));
  }

  if (page <= 4) {
    const headEnd = Math.max(3, page + 1);
    const items: PageItem[] = [];
    for (let i = 1; i <= headEnd; i++) items.push({ type: "page", page: i });
    items.push({ type: "ellipsis", key: "right" });
    items.push({ type: "page", page: pageCount });
    return items;
  }

  if (page >= pageCount - 3) {
    const tailStart = Math.min(pageCount - 2, page - 1);
    const items: PageItem[] = [{ type: "page", page: 1 }];
    items.push({ type: "ellipsis", key: "left" });
    for (let i = tailStart; i <= pageCount; i++) {
      items.push({ type: "page", page: i });
    }
    return items;
  }

  return [
    { type: "page", page: 1 },
    { type: "ellipsis", key: "left" },
    { type: "page", page: page - 1 },
    { type: "page", page: page },
    { type: "page", page: page + 1 },
    { type: "ellipsis", key: "right" },
    { type: "page", page: pageCount },
  ];
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  size = "md",
  tone = "primary",
  className = "",
}: PaginationProps) {
  const [jumpByKey, setJumpByKey] = useState<Record<string, string>>({});

  if (pageCount <= 0) return null;

  const tokens = sizeTokens(size);
  const items = buildPageItems(page, pageCount);
  const linkTone = toneText(tone);

  const baseItem =
    "box-border inline-flex shrink-0 items-center justify-center border border-kit " +
    "p-0 leading-none ";

  function goTo(next: number) {
    if (next < 1 || next > pageCount || next === page) return;
    onPageChange(next);
  }

  function commitJump(key: string) {
    const n = clampPage(Number(jumpByKey[key] ?? ""), pageCount);
    setJumpByKey((prev: Record<string, string>) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (n != null) onPageChange(n);
  }

  function navClass(extra = "") {
    return (
      baseItem +
      tokens.nav +
      " bg-kit-white hover:bg-kit-page " +
      linkTone +
      " disabled:pointer-events-none disabled:text-kit-muted " +
      extra
    );
  }

  function pageClass(p: number, extra = "") {
    return (
      baseItem +
      tokens.box +
      " " +
      (p === page
        ? toneActive(tone)
        : "bg-kit-white hover:bg-kit-page " + linkTone + " ") +
      extra
    );
  }

  return (
    <nav aria-label="Page navigation" className={className}>
      <ul className="mb-0 flex h-fit list-none flex-nowrap items-stretch p-0 font-sans">
        <li className="flex">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className={navClass("rounded-l")}
            aria-label="Previous"
          >
            <ChevronLeft className={tokens.icon} />
          </button>
        </li>

        {items.map((item: PageItem, index: number) => {
          const edge = "border-l-0";
          if (item.type === "page") {
            return (
              <li key={"p-" + item.page} className="flex">
                <button
                  type="button"
                  onClick={() => goTo(item.page)}
                  className={pageClass(item.page, edge)}
                >
                  {item.page}
                </button>
              </li>
            );
          }

          const key = item.key;
          return (
            <li key={"e-" + key + "-" + index} className="flex">
              <input
                type="text"
                inputMode="numeric"
                value={jumpByKey[key] ?? ""}
                placeholder="..."
                title="Nhập số trang rồi Enter"
                aria-label="Jump to page"
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setJumpByKey((prev: Record<string, string>) => ({
                    ...prev,
                    [key]: raw,
                  }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitJump(key);
                }}
                onBlur={() => commitJump(key)}
                className={
                  baseItem +
                  tokens.input +
                  " " +
                  edge +
                  " bg-kit-white text-center outline-none " +
                  linkTone +
                  " placeholder:text-kit-muted focus:z-10 focus:border-kit-primary " +
                  "focus:ring-1 focus:ring-blue-600/25"
                }
              />
            </li>
          );
        })}

        <li className="flex">
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => goTo(page + 1)}
            className={navClass("border-l-0 rounded-r")}
            aria-label="Next"
          >
            <ChevronRight className={tokens.icon} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
