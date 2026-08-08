import { useState, type ReactNode } from "react";
import {
  Button,
  ButtonGroup,
} from "@/shared/elements/Button";
import {
  resolveButtonVariant,
  resolveButtonSize,
  type ButtonVariant,
} from "@/shared/elements/buttonStyles";

export type TabItem = {
  id: string;
  label: string;
  content?: ReactNode;
};

export type TabNavVariant =
  | "body"
  | "nav-tabs"
  | "nav-tabs-justified"
  | "nav-pills"
  | "nav-pills-fill"
  | "nav-justified"
  | "nav-link"
  | "nav-link-header"
  | "animated"
  | "animated-justified"
  | "animated-shadow"
  | "animated-shadow-justified"
  | "btn-group-primary"
  | "btn-outline-alternate-pill"
  | "btn-focus-group"
  | "btn-outline-danger-pill"
  | "btn-outline-primary"
  | "btn-warning-group"
  | "btn-group-primary-center";

type TabNavProps = {
  items: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: TabNavVariant;
  className?: string;
};

function btnClass(
  variant: ButtonVariant,
  size: "sm" | "md",
  extra: string,
  active: boolean,
  shadow = false,
): string {
  return (
    "mb-0 mr-0 inline-flex items-center justify-center font-sans font-medium leading-normal " +
    "transition-all rounded text-sm " +
    resolveButtonVariant(variant) +
    " " +
    resolveButtonSize(size) +
    " " +
    extra +
    (shadow && !active ? " shadow-kit-primary" : "") +
    (active ? " brightness-90" : "")
  );
}

export function TabNav({
  items,
  activeId,
  onChange,
  variant = "nav-tabs",
  className = "",
}: TabNavProps) {
  if (variant === "body") {
    return (
      <ul
        className={
          "body-tabs body-tabs-layout tabs-animated body-tabs-animated nav mb-4 " +
          "flex list-none flex-wrap border-b border-kit p-0 " +
          className
        }
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="nav-item">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(item.id)}
                className={
                  "nav-link relative mr-4 border-0 bg-transparent px-2.5 py-2.5 " +
                  "text-sm font-normal transition-colors " +
                  "before:absolute before:bottom-0 before:left-0 before:block before:h-1 before:w-full " +
                  "before:origin-center before:rounded before:bg-kit-primary before:transition-transform before:duration-200 " +
                  (active
                    ? "text-kit-primary before:scale-x-100"
                    : "text-kit-body before:scale-x-0 hover:text-kit-primary hover:before:scale-x-100")
                }
              >
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  if (
    variant === "btn-group-primary" ||
    variant === "btn-group-primary-center"
  ) {
    return (
      <div
        className={
          variant === "btn-group-primary-center"
            ? "mb-3 text-center " + className
            : className
        }
      >
        <ButtonGroup className="btn-group-sm nav mb-0 mr-0">
          {items.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant="primary"
              active={item.id === activeId}
              shadow
              className="mb-0 mr-0"
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    );
  }

  if (variant === "btn-outline-alternate-pill") {
    return (
      <div className={"nav flex flex-wrap " + className}>
        {items.map((item, i: number) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={btnClass(
                active ? "alternate" : "outline-alternate",
                "sm",
                "btn-pill btn-wide rounded-full! px-6! " +
                  (i > 0 ? "ms-1 me-1 " : ""),
                active,
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "btn-focus-group" || variant === "btn-warning-group") {
    const color: ButtonVariant =
      variant === "btn-warning-group" ? "warning" : "focus";
    return (
      <div
        className={
          variant === "btn-warning-group" ? "mb-3 " + className : className
        }
      >
        <ButtonGroup className="btn-group-sm nav mb-0 mr-0">
          {items.map((item, i: number) => (
            <Button
              key={item.id}
              size="sm"
              variant={color}
              active={item.id === activeId}
              pill={i === 0 || i === items.length - 1}
              className={
                "mb-0 mr-0 " +
                (i === 0 ? "ps-3 " : "") +
                (i === items.length - 1 ? "pe-3 " : "")
              }
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    );
  }

  if (variant === "btn-outline-danger-pill") {
    return (
      <div className={"nav flex flex-wrap " + className}>
        {items.map((item, i: number) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={btnClass(
                active ? "danger" : "outline-danger",
                "sm",
                "btn-pill btn-wide border-0 rounded-full px-6 " +
                  (i > 0 ? "ms-1 me-1 " : ""),
                active,
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "btn-outline-primary") {
    return (
      <div className={"nav flex flex-wrap " + className}>
        {items.map((item, i: number) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={btnClass(
                active ? "primary" : "outline-primary",
                "sm",
                "border-0 " + (i > 0 ? "ms-1 me-1 " : ""),
                active,
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  const justified =
    variant === "nav-tabs-justified" ||
    variant === "nav-justified" ||
    variant === "nav-pills-fill" ||
    variant === "animated-justified" ||
    variant === "animated-shadow-justified";

  const isPills = variant === "nav-pills" || variant === "nav-pills-fill";
  const isTabs = variant === "nav-tabs" || variant === "nav-tabs-justified";
  const isAnimated =
    variant === "animated" ||
    variant === "animated-justified" ||
    variant === "animated-shadow" ||
    variant === "animated-shadow-justified";
  const isShadow =
    variant === "animated-shadow" || variant === "animated-shadow-justified";
  const isHeaderLink =
    variant === "nav-link-header" || variant === "nav-justified";
  const isPlainNav = variant === "nav-link" || isHeaderLink;

  let ulClass = "nav mb-0 flex list-none flex-wrap p-0 ";
  if (isTabs) ulClass += "nav-tabs mb-3 border-b border-kit ";
  if (isPills) ulClass += "nav-pills mb-3 gap-1 ";
  if (isAnimated && isShadow) ulClass += "tabs-animated-shadow tabs-animated ";
  else if (isAnimated) ulClass += "tabs-animated ";
  if (justified) ulClass += "nav-justified w-full [&>li]:flex-1 ";
  if (isPills && variant === "nav-pills-fill") ulClass += "nav-fill ";
  ulClass += className;

  return (
    <ul className={ulClass}>
      {items.map((item) => {
        const active = item.id === activeId;
        let linkClass = "nav-link relative w-full font-bold ";

        if (isPills) {
          linkClass +=
            "rounded-full px-4 py-2 text-sm font-normal " +
            (active
              ? "bg-kit-primary text-white"
              : "text-kit-body hover:text-kit-primary");
        } else if (isShadow) {
          linkClass +=
            "mb-2 mr-2 overflow-hidden rounded px-2 py-1 text-sm font-normal " +
            "before:absolute before:inset-0 before:z-4 before:rounded-full before:bg-kit-primary " +
            "before:opacity-50 before:scale-0 before:shadow-kit-primary " +
            "before:transition-all before:duration-200 " +
            (active
              ? "text-white before:scale-100 before:rounded before:opacity-100"
              : "text-kit-body hover:text-white hover:before:scale-100 hover:before:rounded hover:before:opacity-100");
        } else if (isAnimated) {
          linkClass +=
            "mr-4 px-2.5 py-2.5 text-sm font-normal " +
            "before:absolute before:bottom-0 before:left-0 before:h-1 before:w-full " +
            "before:origin-center before:scale-x-0 before:rounded before:bg-kit-primary before:transition-transform before:duration-200 " +
            (active
              ? "text-kit-primary before:scale-x-100"
              : "text-kit-body hover:text-kit-primary hover:before:scale-x-100");
        } else if (isTabs) {
          linkClass +=
            "relative -mb-px border-b-2 px-4 py-2 text-sm font-normal " +
            (active
              ? "border-kit-primary text-kit-primary"
              : "border-transparent text-kit-muted hover:text-kit-primary");
        } else if (isPlainNav) {
          linkClass +=
            "h-full px-4 py-2 text-sm font-normal normal-case text-kit-muted " +
            "before:absolute before:bottom-0 before:left-0 before:h-1 before:w-full " +
            "before:origin-center before:scale-x-0 before:rounded-full before:bg-kit-primary " +
            "before:opacity-100 before:transition-transform before:duration-200 " +
            (active
              ? "text-kit-primary before:scale-x-100"
              : "hover:text-kit-primary hover:before:scale-x-100");
        } else {
          linkClass +=
            "px-4 py-2 text-sm font-normal " +
            (active
              ? "text-kit-primary"
              : "text-kit-muted hover:text-kit-primary");
        }

        return (
          <li
            key={item.id}
            className={
              "nav-item " +
              (justified || isHeaderLink ? "flex items-center" : "")
            }
          >
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={linkClass}
            >
              {isShadow ? (
                <span className="relative z-5">{item.label}</span>
              ) : (
                item.label
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type TabsProps = {
  tabs: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: TabNavVariant;
  className?: string;
  navClassName?: string;
};

export function Tabs({
  tabs,
  activeId,
  onChange,
  variant = "nav-tabs",
  className = "",
  navClassName = "",
}: TabsProps) {
  const [internalId, setInternalId] = useState(tabs[0]?.id ?? "");
  const currentId = activeId ?? internalId;
  const activeTab = tabs.find((t: TabItem) => t.id === currentId) ?? tabs[0];

  function select(id: string) {
    if (onChange) onChange(id);
    else setInternalId(id);
  }

  return (
    <div className={"font-sans text-sm " + className}>
      <TabNav
        items={tabs.map((t: TabItem) => ({ id: t.id, label: t.label }))}
        activeId={currentId}
        onChange={select}
        variant={variant}
        className={navClassName}
      />
      {activeTab?.content != null ? (
        <div className="tab-content text-sm text-kit-body">
          {activeTab.content}
        </div>
      ) : null}
    </div>
  );
}

type BodyTabsProps = {
  items: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function BodyTabs({
  items,
  activeId,
  onChange,
  className = "",
}: BodyTabsProps) {
  return (
    <TabNav
      items={items}
      activeId={activeId}
      onChange={onChange}
      variant="body"
      className={className}
    />
  );
}
