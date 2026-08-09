import type { ElementType } from "react";
import {
  Rocket,
  Diamond,
  Car,
  Monitor,
  Mouse,
  Pipette,
  Usb,
  LineChart,
  Star,
  ChevronDown,
} from "lucide-react";

export type SettingsMenuLink = {
  label: string;
  path: string;
};

export type SettingsMenuItem = {
  label: string;
  icon: ElementType;
  path?: string;
  children?: SettingsMenuLink[];
};

export type SettingsMenuSection = {
  heading: string;
  items: SettingsMenuItem[];
};

export const SETTINGS_MENU: SettingsMenuSection[] = [
  {
    heading: "Dashboards",
    items: [
      {
        label: "Dashboard Example 1",
        icon: Rocket,
        path: "/demo/dashboards/example-1",
      },
    ],
  },
  {
    heading: "UI Components",
    items: [
      {
        label: "Elements",
        icon: Diamond,
        children: [
          { label: "Buttons", path: "/demo/elements/buttons" },
          { label: "Dropdowns", path: "/demo/elements/dropdowns" },
          { label: "Icons", path: "/demo/elements/icons" },
          { label: "Badges", path: "/demo/elements/badges" },
          { label: "Cards", path: "/demo/elements/cards" },
          { label: "List Groups", path: "/demo/elements/list-groups" },
          { label: "Navigation Menus", path: "/demo/elements/navigation" },
          { label: "Utilities", path: "/demo/elements/utilities" },
        ],
      },
      {
        label: "Components",
        icon: Car,
        children: [
          { label: "Tabs", path: "/demo/components/tabs" },
          { label: "Accordions", path: "/demo/components/accordions" },
          { label: "Notifications", path: "/demo/components/notifications" },
          { label: "Modals", path: "/demo/components/modals" },
          { label: "Progress Bar", path: "/demo/components/progress" },
          { label: "Tooltips & Popovers", path: "/demo/components/tooltips" },
          { label: "Carousel", path: "/demo/components/carousel" },
          { label: "Calendar", path: "/demo/components/calendar" },
          { label: "Pagination", path: "/demo/components/pagination" },
          { label: "Scrollable", path: "/demo/components/scrollable" },
          { label: "Maps", path: "/demo/components/maps" },
        ],
      },
      {
        label: "Tables",
        icon: Monitor,
        path: "/demo/tables/regular",
        children: [
          { label: "Regular Tables", path: "/demo/tables/regular" },
          { label: "Data Tables", path: "/demo/tables/datatable" },
        ],
      },
    ],
  },
  {
    heading: "Widgets",
    items: [
      {
        label: "Dashboard Boxes",
        icon: Monitor,
        path: "/demo/widgets/boxes",
      },
    ],
  },
  {
    heading: "Forms",
    items: [
      {
        label: "Forms Controls",
        icon: Mouse,
        path: "/demo/forms/controls",
      },
      {
        label: "Forms Layouts",
        icon: Pipette,
        path: "/demo/forms/layouts",
      },
      {
        label: "Forms Validation",
        icon: Usb,
        path: "/demo/forms/validation",
      },
    ],
  },
  {
    heading: "Charts",
    items: [
      {
        label: "Recharts",
        icon: LineChart,
        path: "/demo/charts/recharts",
      },
    ],
  },
  {
    heading: "PRO Version",
    items: [
      {
        label: "Upgrade to PRO",
        icon: Star,
        path: "https://dashboardpack.com/theme-details/architectui-dashboard-html-pro/",
      },
    ],
  },
];

export const SETTINGS_MENU_CHEVRON = ChevronDown;

export function findSettingsPageTitle(pathname: string): {
  title: string;
  subtitle: string;
} {
  if (
    pathname === "/demo" ||
    pathname === "/demo/" ||
    pathname.startsWith("/demo/dashboards/example-1")
  ) {
    return {
      title: "Analytics Dashboard",
      subtitle:
        "This is an example dashboard created using build-in elements and components.",
    };
  }

  for (const section of SETTINGS_MENU) {
    for (const item of section.items) {
      if (item.path && !item.path.startsWith("http") && pathname.startsWith(item.path)) {
        return {
          title: item.label,
          subtitle:
            "This is an example page created using build-in elements and components.",
        };
      }
      if (item.children) {
        for (const child of item.children) {
          if (pathname.startsWith(child.path)) {
            return {
              title: child.label,
              subtitle:
                "This is an example page created using build-in elements and components.",
            };
          }
        }
      }
    }
  }

  return {
    title: "ArchitectUI",
    subtitle: "Free demo playground",
  };
}
