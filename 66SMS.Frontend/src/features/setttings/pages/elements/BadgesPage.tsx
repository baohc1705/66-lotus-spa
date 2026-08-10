import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Button, type ButtonVariant } from "@/shared/elements/Button";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const colors: { variant: BadgeVariant; label: string }[] = [
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
];

const buttonColors: { variant: ButtonVariant; label: string }[] = [
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
];

export function BadgesPage() {
  return (
    <DemoPageShell
      title="Badges & Labels"
      subtitle="Badges and labels are used to offer extra small pieces of info for your content."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoSection title="Buttons Badges">
          <div className="flex flex-wrap">
            {buttonColors.map((item) => (
              <Button key={"bb-" + item.variant} variant={item.variant}>
                {item.label}
                <Badge
                  variant={item.variant === "light" ? "dark" : "light"}
                  pill
                  className="ml-2 normal-case"
                >
                  6
                </Badge>
              </Button>
            ))}
            <Button variant="link">
              Link 1
              <Badge variant="primary" pill className="ml-2 normal-case">
                6
              </Badge>
            </Button>
            <Button variant="link">
              Link 2
              <Badge variant="success" pill className="ml-2 normal-case">
                6
              </Badge>
            </Button>
            <Button variant="link">
              Link 3
              <Badge variant="danger" pill className="ml-2 normal-case">
                6
              </Badge>
            </Button>
            <Button variant="link">
              Link 4
              <Badge variant="warning" pill className="ml-2 normal-case">
                6
              </Badge>
            </Button>
          </div>
        </DemoSection>

        <DemoSection title="With Buttons">
          <div className="flex flex-wrap">
            {buttonColors.map((item) => (
              <Button key={"wb-" + item.variant} variant={item.variant}>
                {item.label}
                <Badge
                  variant={item.variant === "light" ? "dark" : "light"}
                  className="ml-2 normal-case"
                >
                  NEW
                </Badge>
              </Button>
            ))}
            <Button variant="link">
              Link 1
              <Badge variant="primary" className="ml-2 normal-case">
                NEW
              </Badge>
            </Button>
            <Button variant="link">
              Link 2
              <Badge variant="success" className="ml-2 normal-case">
                NEW
              </Badge>
            </Button>
            <Button variant="link">
              Link 3
              <Badge variant="danger" className="ml-2 normal-case">
                NEW
              </Badge>
            </Button>
            <Button variant="link">
              Link 4
              <Badge variant="warning" className="ml-2 normal-case">
                NEW
              </Badge>
            </Button>
          </div>
        </DemoSection>
      </div>

      <DemoSection title="Colors">
        <div className="flex flex-wrap">
          {colors.map((item) => (
            <Badge key={"c-" + item.variant} variant={item.variant} className="mb-2 mr-2">
              {item.label}
            </Badge>
          ))}
        </div>

        <hr className="my-4 border-kit" />

        <h5 className="mb-2 text-sm font-bold uppercase text-kit-heading">
          Soft
        </h5>
        <div className="flex flex-wrap">
          {colors.map((item) => (
            <Badge
              key={"s-" + item.variant}
              variant={item.variant}
              soft
              className="mb-2 mr-2"
            >
              {item.label}
            </Badge>
          ))}
        </div>

        <hr className="my-4 border-kit" />

        <h5 className="mb-2 text-sm font-bold uppercase text-kit-heading">
          Pills
        </h5>
        <div className="flex flex-wrap">
          {colors.map((item) => (
            <Badge
              key={"p-" + item.variant}
              variant={item.variant}
              pill
              className="mb-2 mr-2"
            >
              {item.label}
            </Badge>
          ))}
        </div>

        <hr className="my-4 border-kit" />

        <h5 className="mb-2 text-sm font-bold uppercase text-kit-heading">
          Links
        </h5>
        <div className="flex flex-wrap">
          {colors.map((item) => (
            <Badge
              key={"l-" + item.variant}
              variant={item.variant}
              href="#"
              className="mb-2 mr-2"
            >
              {item.label}
            </Badge>
          ))}
        </div>
      </DemoSection>
    </DemoPageShell>
  );
}
