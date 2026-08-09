import { useState } from "react";
import { Button, ButtonGroup, type ButtonVariant } from "@/shared/elements/Button";
import { Switch } from "@/shared/forms/Switch";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const solidVariants: { variant: ButtonVariant; label: string }[] = [
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
  { variant: "link", label: "link" },
];

const outlineVariants: { variant: ButtonVariant; label: string }[] = [
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
  { variant: "outline-link", label: "link" },
];

function ToggleGroup(props: {
  variant: ButtonVariant;
  size?: "sm" | "md" | "lg";
  mode: "checkbox" | "radio";
}) {
  const [selected, setSelected] = useState(
    props.mode === "radio" ? "one" : (["one"] as string[]),
  );

  function isOn(key: string) {
    if (props.mode === "radio") return selected === key;
    return (selected as string[]).includes(key);
  }

  function toggle(key: string) {
    if (props.mode === "radio") {
      setSelected(key);
      return;
    }
    const list = selected as string[];
    if (list.includes(key)) {
      setSelected(list.filter((x: string) => x !== key));
    } else {
      setSelected([...list, key]);
    }
  }

  return (
    <ButtonGroup className="mb-3">
      <Button
        variant={props.variant}
        size={props.size}
        active={isOn("one")}
        onClick={() => toggle("one")}
        className="rounded-none rounded-l"
      >
        One
      </Button>
      <Button
        variant={props.variant}
        size={props.size}
        active={isOn("two")}
        onClick={() => toggle("two")}
        className="rounded-none"
      >
        Two
      </Button>
      <Button
        variant={props.variant}
        size={props.size}
        active={isOn("three")}
        onClick={() => toggle("three")}
        className="rounded-none rounded-r"
      >
        Three
      </Button>
    </ButtonGroup>
  );
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  const [notify, setNotify] = useState(false);
  const [dark, setDark] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <Switch checked={on} onChange={setOn} label={on ? "On" : "Off"} />
      <Switch
        checked={notify}
        onChange={setNotify}
        tone="success"
        label="Enable notifications"
      />
      <Switch checked={dark} onChange={setDark} tone="dark" label="Dark mode" />
      <Switch checked={true} onChange={() => {}} tone="danger" label="Danger on" />
      <Switch checked={true} onChange={() => {}} tone="alternate" label="Alt on" />
      <Switch checked={true} onChange={() => {}} label="Disabled on" disabled />
      <Switch
        checked={false}
        onChange={() => {}}
        label="Disabled off"
        disabled
      />
    </div>
  );
}

export function ButtonsPage() {
  return (
    <DemoPageShell
      title="Standard Buttons"
      subtitle="Wide selection of buttons that feature different styles for backgrounds, borders and hover options!"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoSection title="Solid">
          <div className="flex flex-wrap">
            {solidVariants.map((item) => (
              <Button key={item.variant} variant={item.variant}>
                {item.label}
              </Button>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Color Transition">
          <div className="flex flex-wrap">
            {outlineVariants.map((item) => (
              <Button key={item.variant} variant={item.variant}>
                {item.label}
              </Button>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Color Transition No Borders">
          <div className="flex flex-wrap">
            {outlineVariants.map((item) => (
              <Button
                key={"nb-" + item.variant}
                variant={item.variant}
                borderless
              >
                {item.label}
              </Button>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Active State">
          <div className="flex flex-wrap">
            {solidVariants.map((item) => (
              <Button key={"a-" + item.variant} variant={item.variant} active>
                {item.label}
              </Button>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Disabled State">
          <div className="flex flex-wrap">
            {solidVariants.map((item) => (
              <Button
                key={"d-" + item.variant}
                variant={item.variant}
                disabled
              >
                {item.label}
              </Button>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Block Level">
          <div className="grid gap-2">
            <Button variant="primary" size="lg" block>
              Block Large
            </Button>
            <Button variant="primary" block>
              Block Normal
            </Button>
            <Button variant="primary" size="sm" block>
              Block Small
            </Button>
          </div>
        </DemoSection>

        <DemoSection title="Checkbox Buttons">
          <div className="flex flex-col items-center gap-3">
            <ToggleGroup variant="primary" size="sm" mode="checkbox" />
            <ToggleGroup variant="danger" mode="checkbox" />
            <ToggleGroup variant="alternate" size="lg" mode="checkbox" />
          </div>
        </DemoSection>

        <DemoSection title="Radio Buttons">
          <div className="flex flex-col items-center gap-3">
            <ToggleGroup variant="primary" size="sm" mode="radio" />
            <ToggleGroup variant="warning" mode="radio" />
            <ToggleGroup variant="focus" size="lg" mode="radio" />
          </div>
        </DemoSection>

        <DemoSection title="Switch">
          <SwitchDemo />
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
