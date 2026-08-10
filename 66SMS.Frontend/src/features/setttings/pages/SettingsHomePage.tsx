import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import { DemoPageShell, DemoSection } from "../components/DemoPageShell";
import { SETTINGS_MENU } from "../constants/settingsMenu";
import { StatCard } from "@/shared/widgets/StatCard";
import { Button } from "@/shared/elements/Button";

export function SettingsHomePage() {
  return (
    <DemoPageShell
      title="Analytics Dashboard"
      subtitle="This is an example dashboard created using build-in elements and components."
      icon={Rocket}
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value="1,896" description="Last year expenses" />
        <StatCard title="Clients" value="$568" description="Total Clients Profit" />
        <StatCard title="Followers" value="46%" description="People Interested" />
        <StatCard title="Products Sold" value="$14M" description="Revenue streams" />
      </div>

      <DemoSection title="UI Components Catalog">
        <p className="mb-4 text-sm text-kit-muted">
          Sidebar bên trái mirror{" "}
          <a
            href="https://demo.dashboardpack.com/architectui-html-free/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-kit-primary hover:underline"
          >
            ArchitectUI Free demo
          </a>
          . Chọn mục để xem component React + Tailwind.
        </p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SETTINGS_MENU.map((section) => (
            <div
              key={section.heading}
              className="rounded-md border border-kit bg-kit-page p-4"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-kit-primary">
                {section.heading}
              </div>
              <ul className="m-0 list-none space-y-1 p-0">
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.path ? (
                      <Link
                        to={item.path}
                        className="block rounded px-2 py-1.5 text-sm text-kit-body no-underline hover:bg-kit-white hover:text-kit-primary"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <div>
                        <div className="px-2 py-1 text-sm font-semibold text-kit-heading">
                          {item.label}
                        </div>
                        <ul className="ml-2 list-none border-l border-kit pl-2">
                          {item.children?.map((child) => (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                className="block rounded px-2 py-1 text-sm text-kit-muted no-underline hover:bg-kit-white hover:text-kit-primary"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="Quick start">
        <div className="flex flex-wrap gap-2">
          <Link to="/demo/elements/buttons">
            <Button size="sm">Buttons</Button>
          </Link>
          <Link to="/demo/components/modals">
            <Button size="sm" variant="outline">
              Modals
            </Button>
          </Link>
          <Link to="/demo/forms/layouts">
            <Button size="sm" variant="secondary">
              Forms Layouts
            </Button>
          </Link>
          <Link to="/demo/dashboards/example-1">
            <Button size="sm" variant="ghost">
              Dashboard Example 1
            </Button>
          </Link>
        </div>
      </DemoSection>
    </DemoPageShell>
  );
}
