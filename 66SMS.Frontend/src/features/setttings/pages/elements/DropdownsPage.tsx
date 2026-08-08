import { Dropdown } from "@/shared/elements/Dropdown";
import type { ButtonVariant } from "@/shared/elements/Button";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const solidColors: { variant: ButtonVariant; label: string }[] = [
  { variant: "primary", label: "Primary" },
  { variant: "secondary", label: "Secondary" },
  { variant: "success", label: "Success" },
  { variant: "info", label: "Info" },
  { variant: "warning", label: "Warning" },
  { variant: "danger", label: "Danger" },
  { variant: "focus", label: "Focus" },
  { variant: "alternate", label: "Alt" },
  { variant: "light", label: "Light" },
  { variant: "dark", label: "Dark" },
  { variant: "link", label: "Link" },
];

const outlineColors: { variant: ButtonVariant; label: string }[] = [
  { variant: "outline-primary", label: "Primary" },
  { variant: "outline-secondary", label: "Secondary" },
  { variant: "outline-success", label: "Success" },
  { variant: "outline-info", label: "Info" },
  { variant: "outline-warning", label: "Warning" },
  { variant: "outline-danger", label: "Danger" },
  { variant: "outline-focus", label: "Focus" },
  { variant: "outline-alternate", label: "Alt" },
  { variant: "outline-light", label: "Light" },
  { variant: "outline-dark", label: "Dark" },
  { variant: "outline-link", label: "Link" },
];

const splitColors = solidColors.filter(
  (item) => item.variant !== "link"
);

const splitOutlineColors = outlineColors.filter(
  (item) => item.variant !== "outline-link"
);

export function DropdownsPage() {
  return (
    <DemoPageShell
      title="Dropdowns"
      subtitle="Multiple styles, actions and effects are available for the Architect Framework dropdown buttons"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <DemoSection title="Basic">
            <div className="flex flex-wrap">
              {solidColors.map((item) => (
                <Dropdown
                  key={"b-" + item.variant}
                  label={item.label}
                  variant={item.variant}
                />
              ))}
            </div>
          </DemoSection>

          <DemoSection title="Split Dropdowns">
            <div className="flex flex-wrap">
              {splitColors.map((item) => (
                <Dropdown
                  key={"s-" + item.variant}
                  label={item.label}
                  variant={item.variant}
                  split
                />
              ))}
            </div>
          </DemoSection>

          <DemoSection title="Split Outline Dropdowns">
            <div className="flex flex-wrap">
              {splitOutlineColors.map((item) => (
                <Dropdown
                  key={"so-" + item.variant}
                  label={item.label}
                  variant={item.variant}
                  split
                />
              ))}
            </div>
          </DemoSection>

          <DemoSection title="Menu positions">
            <div className="flex flex-wrap justify-center">
              <Dropdown label="Dropleft" variant="primary" split placement="left" wide />
              <Dropdown label="Dropup" variant="primary" split placement="top" wide />
              <Dropdown label="Dropright" variant="primary" split placement="right" wide />
            </div>
            <hr className="my-4 border-gray-100" />
            <div className="flex flex-wrap justify-center">
              <Dropdown label="Dropleft" variant="primary" placement="left" wide />
              <Dropdown label="Dropup" variant="primary" placement="top" wide />
              <Dropdown label="Dropright" variant="primary" placement="right" wide />
            </div>
          </DemoSection>
        </div>

        <div className="space-y-4">
          <DemoSection title="Outline">
            <div className="flex flex-wrap">
              {outlineColors.map((item) => (
                <Dropdown
                  key={"o-" + item.variant}
                  label={item.label}
                  variant={item.variant}
                />
              ))}
            </div>
          </DemoSection>

          <DemoSection title="Sizing">
            <div className="mb-4 flex flex-wrap justify-center">
              <Dropdown label="Large" variant="primary" size="lg" split />
              <Dropdown label="Normal" variant="primary" split />
              <Dropdown label="Small" variant="primary" size="sm" split />
            </div>
            <hr className="my-4 border-gray-100" />
            <div className="flex flex-wrap justify-center">
              <Dropdown label="Large" variant="primary" size="lg" />
              <Dropdown label="Normal" variant="primary" />
              <Dropdown label="Small" variant="primary" size="sm" />
            </div>
          </DemoSection>
        </div>
      </div>
    </DemoPageShell>
  );
}
