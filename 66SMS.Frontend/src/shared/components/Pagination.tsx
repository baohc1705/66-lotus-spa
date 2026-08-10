import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type PaginationSize = "sm" | "md" | "lg";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  className?: string;
  edgeCount?: number;
};

function sizeTokens(size: PaginationSize) {
  if (size === "sm") {
    return {
      box: "size-8 text-sm",
      icon: "size-3.5",
      input: "h-8 w-10 text-sm",
    };
  }
  if (size === "lg") {
    return {
      box: "size-11 text-base",
      icon: "size-5",
      input: "h-11 w-14 text-base",
    };
  }
  return {
    box: "size-9 text-sm",
    icon: "size-4",
    input: "h-9 w-12 text-sm",
  };
}

function clampPage(value: number, pageCount: number): number | null {
  if (!Number.isFinite(value)) return null;
  const n = Math.floor(value);
  if (n < 1 || n > pageCount) return null;
  return n;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  size = "md",
  className = "",
  edgeCount = 3,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  if (pageCount <= 0) return null;

  const tokens = sizeTokens(size);
  const baseItem =
    "box-border inline-flex shrink-0 items-center justify-center border border-kit " +
    "p-0 leading-none ";

  const btnItem = baseItem + tokens.box + " ";
  const inputItem = baseItem + tokens.input + " ";

  function goTo(next: number) {
    if (next < 1 || next > pageCount || next === page) return;
    onPageChange(next);
  }

  function commitJump() {
    const n = clampPage(Number(jumpValue), pageCount);
    setJumpValue("");
    if (n != null) onPageChange(n);
  }

  const useWindow = pageCount > edgeCount * 2 + 1;
  const headPages: number[] = [];
  const tailPages: number[] = [];

  if (!useWindow) {
    for (let i = 1; i <= pageCount; i++) headPages.push(i);
  } else {
    for (let i = 1; i <= edgeCount; i++) headPages.push(i);
    const tailStart = pageCount - edgeCount + 1;
    for (let i = tailStart; i <= pageCount; i++) {
      if (!headPages.includes(i)) tailPages.push(i);
    }
  }

  const showJump = useWindow && tailPages.length > 0;

  function navClass(extra = "") {
    return (
      btnItem +
      "bg-kit-white text-kit-primary hover:bg-kit-page " +
      "disabled:pointer-events-none disabled:text-kit-muted " +
      extra
    );
  }

  function pageClass(p: number, extra = "") {
    return (
      btnItem +
      (p === page
        ? "bg-kit-primary text-kit-white border-kit-primary "
        : "bg-kit-white text-kit-primary hover:bg-kit-page ") +
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
            onClick={() => goTo(1)}
            className={navClass("rounded-l")}
            aria-label="First page"
          >
            <ChevronsLeft className={tokens.icon} />
          </button>
        </li>
        <li className="flex">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className={navClass("border-l-0")}
            aria-label="Previous"
          >
            <ChevronLeft className={tokens.icon} />
          </button>
        </li>

        {headPages.map((p: number) => (
          <li key={"h-" + p} className="flex">
            <button
              type="button"
              onClick={() => goTo(p)}
              className={pageClass(p, "border-l-0")}
            >
              {p}
            </button>
          </li>
        ))}

        {showJump ? (
          <li className="flex">
            <input
              type="text"
              inputMode="numeric"
              value={jumpValue}
              placeholder=".."
              title="Nhap so trang roi Enter"
              aria-label="Jump to page"
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setJumpValue(raw);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitJump();
              }}
              onBlur={commitJump}
              className={
                inputItem +
                "border-l-0 bg-kit-white text-center text-kit-primary outline-none " +
                "placeholder:text-kit-muted focus:z-10 focus:border-kit-primary " +
                "focus:ring-1 focus:ring-blue-600/25"
              }
            />
          </li>
        ) : null}

        {tailPages.map((p: number) => (
          <li key={"t-" + p} className="flex">
            <button
              type="button"
              onClick={() => goTo(p)}
              className={pageClass(p, "border-l-0")}
            >
              {p}
            </button>
          </li>
        ))}

        <li className="flex">
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => goTo(page + 1)}
            className={navClass("border-l-0")}
            aria-label="Next"
          >
            <ChevronRight className={tokens.icon} />
          </button>
        </li>
        <li className="flex">
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => goTo(pageCount)}
            className={navClass("border-l-0 rounded-r")}
            aria-label="Last page"
          >
            <ChevronsRight className={tokens.icon} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
