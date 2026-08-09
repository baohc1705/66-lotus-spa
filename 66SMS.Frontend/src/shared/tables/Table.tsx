import type { CSSProperties, ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  bordered?: boolean;
  borderless?: boolean;
  striped?: boolean;
  hover?: boolean;
  dark?: boolean;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
};

export function Table({
  children,
  bordered = false,
  borderless = false,
  striped = false,
  hover = false,
  dark = false,
  size = "md",
  className,
  style,
}: TableProps) {
  let tableClass =
    "mb-0 w-full border-collapse text-left text-sm " +
    "[&_th]:box-border [&_td]:box-border [&_th]:align-middle [&_td]:align-middle ";

  tableClass += size === "sm" ? "[&_th]:p-1 [&_td]:p-1 " : "[&_th]:p-2 [&_td]:p-2 ";

  if (dark) {
    tableClass +=
      "bg-kit-dark text-kit-white " +
      "[&_th]:bg-kit-dark [&_td]:bg-kit-dark [&_th]:font-bold [&_th]:text-kit-white [&_td]:text-kit-white ";
  } else {
    // Không gắn màu chữ th ở đây — DataTable/TableHead tự set (tránh đè text-kit-white header primary)
    tableClass += "bg-kit-white text-kit-body [&_th]:font-bold ";
  }

  const cellBorder = dark ? "border-kit-white/20" : "border-kit";

  if (bordered) {
    tableClass +=
      "border " +
      cellBorder +
      " [&_th]:border [&_td]:border [&_th]:" +
      cellBorder +
      " [&_td]:" +
      cellBorder +
      " ";
  } else if (borderless) {
    tableClass += "[&_th]:border-0 [&_td]:border-0 ";
  } else {
    tableClass +=
      "[&_th]:border-b [&_td]:border-b [&_th]:" +
      cellBorder +
      " [&_td]:" +
      cellBorder +
      " ";
  }

  if (striped) {
    tableClass += dark
      ? "[&_tbody_tr:nth-child(odd)_td]:bg-kit-white/5 [&_tbody_tr:nth-child(odd)_th]:bg-kit-white/5 "
      : "[&_tbody_tr:nth-child(odd)_td]:bg-kit-page [&_tbody_tr:nth-child(odd)_th]:bg-kit-page ";
  }

  if (hover) {
    tableClass += dark
      ? "[&_tbody_tr:hover_td]:bg-kit-white/10 [&_tbody_tr:hover_th]:bg-kit-white/10 "
      : "[&_tbody_tr:hover_td]:bg-kit-page [&_tbody_tr:hover_th]:bg-kit-page ";
  }

  if (className) tableClass += className;

  return (
    <table className={tableClass} style={style}>
      {children}
    </table>
  );
}

export function TableResponsive({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={"w-full overflow-x-auto " + (className ?? "")}>{children}</div>;
}

export function TableHead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead className={"[&_th]:text-kit-muted " + className}>{children}</thead>
  );
}

export function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <tr onClick={onClick} style={style} className={className}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <th style={style} className={className}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  style,
  colSpan,
  rowSpan,
  asHeader,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  colSpan?: number;
  rowSpan?: number;
  asHeader?: boolean;
}) {
  if (asHeader) {
    return (
      <th
        colSpan={colSpan}
        rowSpan={rowSpan}
        style={style}
        className={className}
        scope="row"
      >
        {children}
      </th>
    );
  }

  return (
    <td colSpan={colSpan} rowSpan={rowSpan} style={style} className={className}>
      {children}
    </td>
  );
}
