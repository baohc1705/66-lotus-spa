import { Tooltip } from "@/shared/components/Tooltip";
import { Popover } from "@/shared/components/Popover";
import { Button } from "@/shared/elements/Button";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const popoverText = "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.";

export function TooltipsPage() {
  return (
    <DemoPageShell
      title="Tooltips & Popovers"
      subtitle="These React components are used for showing additional information on hover or click."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoSection title="Basic">
          <div className="text-center">
            <Popover
              placement="top"
              trigger={<Button variant="primary">Popover on top</Button>}
              content={<p className="mb-0">{popoverText}</p>}
            />
            <Popover
              placement="right"
              trigger={<Button variant="primary">Popover on right</Button>}
              content={<p className="mb-0">{popoverText}</p>}
            />
            <Popover
              placement="bottom"
              trigger={<Button variant="primary">Popover on bottom</Button>}
              content={<p className="mb-0">{popoverText}</p>}
            />
            <Popover
              placement="left"
              trigger={<Button variant="primary">Popover on left</Button>}
              content={<p className="mb-0">{popoverText}</p>}
            />
          </div>
        </DemoSection>

        <DemoSection title="Dark Tooltips">
          <div className="text-center">
            <Tooltip text="Tooltip on top" placement="top">
              <Button variant="primary">Tooltip on top</Button>
            </Tooltip>
            <Tooltip text="Tooltip on right" placement="right">
              <Button variant="primary">Tooltip on right</Button>
            </Tooltip>
            <Tooltip text="Tooltip on bottom" placement="bottom">
              <Button variant="primary">Tooltip on bottom</Button>
            </Tooltip>
            <Tooltip text="Tooltip on left" placement="left">
              <Button variant="primary">Tooltip on left</Button>
            </Tooltip>
          </div>
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
