import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  type MenuGroup,
  type MenuItem,
  type SubMenuItem,
} from "../constants/menu";
import { useMenuByRole } from "../hooks/useMenuByRole";

type AdminSidebarProps = {
  closed: boolean;
  mobileOpen: boolean;
  onNavigate?: () => void;
};

function collectMenuPaths(groups: MenuGroup[]): string[] {
  const paths: string[] = [];
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];
    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
      const item = group.items[itemIndex];
      if (item.path) paths.push(item.path);
      if (item.children) {
        for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
          paths.push(item.children[childIndex].path);
        }
      }
    }
  }
  return paths;
}

function isPathActive(pathname: string, path?: string) {
  if (!path) return false;
  if (path === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === path || pathname.startsWith(path + "/");
}

function findBestMatchingPath(pathname: string, paths: string[]) {
  let best: string | null = null;
  for (const path of paths) {
    if (!isPathActive(pathname, path)) continue;
    if (best == null || path.length > best.length) best = path;
  }
  return best;
}

function itemHasActiveChild(pathname: string, item: MenuItem) {
  if (!item.children) return false;
  return item.children.some((child: SubMenuItem) =>
    isPathActive(pathname, child.path),
  );
}

function findOpenLabel(pathname: string, groups: MenuGroup[]): string | null {
  for (const group of groups) {
    for (const item of group.items) {
      if (itemHasActiveChild(pathname, item)) return item.label;
    }
  }
  return null;
}

export function AdminSidebar(props: AdminSidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const visibleGroups = useMenuByRole();
  const menuPaths = collectMenuPaths(visibleGroups);
  const bestActivePath = findBestMatchingPath(pathname, menuPaths);
  const [openLabel, setOpenLabel] = useState<string | null>(() =>
    findOpenLabel(pathname, visibleGroups),
  );
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenLabel(findOpenLabel(pathname, visibleGroups));
  }

  function toggleMenu(label: string) {
    setOpenLabel((prev) => (prev === label ? null : label));
  }

  function onChildClick() {
    if (props.onNavigate) props.onNavigate();
  }

  return (
    <aside
      className={
        "app-sidebar sidebar-shadow group/sidebar relative z-10 flex h-full shrink-0 flex-col " +
        "overflow-hidden border-r border-kit bg-kit-white shadow-kit-card " +
        "transition-[width,min-width,flex-basis] duration-300 ease-in-out " +
        (props.closed
          ? "w-20 min-w-20 basis-20 hover:w-70 hover:min-w-70 hover:basis-70"
          : "w-70 min-w-70 basis-70")
      }
    >
      <div className="scrollbar-sidebar h-full w-full overflow-y-auto overflow-x-hidden">
        <div className="app-sidebar__inner px-4 pb-4 pt-0.5">
          <ul className="vertical-nav-menu relative m-0 list-none p-0">
            {visibleGroups.map((group: MenuGroup, groupIndex: number) => (
              <li
                key={group.title ?? `group-${groupIndex}`}
                className="list-none"
              >
                {group.title ? (
                  <div
                    className={
                      "app-sidebar__heading relative my-2 text-xs font-bold uppercase " +
                      "whitespace-nowrap text-kit-primary " +
                      (props.closed
                        ? "indent-[-999em] before:absolute before:top-1/2 before:left-0 before:h-px " +
                          "before:w-full before:bg-blue-50 group-hover/sidebar:indent-0 " +
                          "group-hover/sidebar:before:hidden"
                        : "")
                    }
                  >
                    {group.title}
                  </div>
                ) : (
                  <div className="my-2" />
                )}

                <ul className="m-0 list-none p-0">
                  {group.items.map((item: MenuItem) => {
                    const Icon = item.icon;
                    const hasChildren = !!item.children?.length;
                    const isOpen = openLabel === item.label;
                    const parentActive = itemHasActiveChild(pathname, item);
                    const isActiveLeaf = item.path
                      ? bestActivePath === item.path
                      : false;

                    const linkBase =
                      "relative my-[0.1rem] flex h-[2.4rem] items-center rounded whitespace-nowrap " +
                      "text-kit-heading no-underline transition-all duration-200 " +
                      (props.closed
                        ? "px-0 group-hover/sidebar:pr-4 group-hover/sidebar:pl-[45px] "
                        : "pr-4 pl-[45px] ");

                    const iconClass =
                      "metismenu-icon absolute top-1/2 size-5 -translate-y-1/2 " +
                      "opacity-30 transition-opacity " +
                      (props.closed
                        ? "left-1/2 -ml-[11px] group-hover/sidebar:left-[10px] group-hover/sidebar:ml-0 "
                        : "left-[10px] ");

                    if (hasChildren) {
                      const bestChildPath = findBestMatchingPath(
                        pathname,
                        item.children!.map((c: SubMenuItem) => c.path),
                      );
                      return (
                        <li
                          key={item.label}
                          className={
                            isOpen || parentActive ? "mm-active" : undefined
                          }
                        >
                          <button
                            type="button"
                            title={item.label}
                            onClick={() => toggleMenu(item.label)}
                            className={
                              linkBase +
                              "w-full cursor-pointer border-0 bg-transparent text-left text-sm " +
                              "hover:bg-blue-50 " +
                              (isOpen || parentActive
                                ? "font-bold"
                                : "font-normal")
                            }
                          >
                            <Icon className={iconClass + "text-kit-muted"} />
                            <span
                              className={
                                "flex-1 truncate " +
                                (props.closed
                                  ? "invisible w-0 group-hover/sidebar:visible group-hover/sidebar:w-auto"
                                  : "")
                              }
                            >
                              {item.label}
                            </span>
                            <ChevronDown
                              className={
                                "metismenu-state-icon absolute top-1/2 right-0 h-5 w-5 -translate-y-1/2 " +
                                "text-kit-muted opacity-30 transition-transform duration-300 " +
                                (isOpen ? "-rotate-180 opacity-100" : "") +
                                (props.closed
                                  ? " invisible group-hover/sidebar:visible"
                                  : "")
                              }
                            />
                          </button>

                          <ul
                            className={
                              "relative m-0 list-none overflow-hidden transition-all duration-300 " +
                              (isOpen
                                ? "mm-show py-2 pl-8 " +
                                  (props.closed
                                    ? "max-h-0 py-0 group-hover/sidebar:max-h-screen group-hover/sidebar:py-2"
                                    : "max-h-screen")
                                : "mm-collapse max-h-0 py-0")
                            }
                          >
                            {isOpen ? (
                              <span
                                aria-hidden
                                className={
                                  "pointer-events-none absolute top-0 left-5 h-full w-1 rounded-full bg-blue-50 " +
                                  (props.closed
                                    ? "hidden group-hover/sidebar:block"
                                    : "block")
                                }
                              />
                            ) : null}
                            {item.children!.map((child: SubMenuItem) => {
                              const childActive = bestChildPath === child.path;
                              return (
                                <li key={child.path}>
                                  <Link
                                    to={child.path}
                                    onClick={onChildClick}
                                    className={
                                      "relative my-[0.1rem] flex h-8 items-center rounded px-4 text-sm " +
                                      "no-underline transition-colors " +
                                      (childActive
                                        ? "bg-blue-50 font-bold text-kit-primary"
                                        : "text-kit-muted hover:bg-blue-50 hover:text-kit-primary") +
                                      (props.closed
                                        ? " h-0 overflow-hidden p-0 group-hover/sidebar:h-8 group-hover/sidebar:px-4"
                                        : "")
                                    }
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      );
                    }

                    return (
                      <li key={item.label}>
                        <Link
                          to={item.path!}
                          title={item.label}
                          onClick={onChildClick}
                          className={
                            linkBase +
                            " text-sm " +
                            (isActiveLeaf
                              ? "bg-blue-50 font-bold text-kit-primary"
                              : "hover:bg-blue-50")
                          }
                        >
                          <Icon
                            className={
                              iconClass +
                              (isActiveLeaf
                                ? "text-kit-primary opacity-80"
                                : "text-kit-muted")
                            }
                          />
                          <span
                            className={
                              "truncate " +
                              (props.closed
                                ? "invisible w-0 group-hover/sidebar:visible group-hover/sidebar:w-auto"
                                : "")
                            }
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
