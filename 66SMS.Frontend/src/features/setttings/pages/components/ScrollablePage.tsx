import { Leaf, CloudDownload, Menu } from "lucide-react";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { Dropdown } from "@/shared/elements/Dropdown";
import { Button } from "@/shared/elements/Button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@/shared/elements/Card";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const paragraphs = (
  <>
    <p className="mb-3">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sodales
      ullamcorper vehicula. Duis placerat quam porta lorem lobortis, sit amet
      sodales mauris finibus. Donec posuere diam at volutpat viverra. Cras
      fringilla auctor augue sed congue. Maecenas mollis quis enim quis egestas.
      In sollicitudin mi a pretium varius. Integer eleifend sodales pharetra.
    </p>
    <p className="mb-3">
      Nunc congue magna eget eros blandit, eu viverra magna semper. Nullam in
      diam a metus dictum consequat. Quisque ultricies, ipsum non euismod semper,
      velit felis lacinia nibh, et finibus quam leo vitae nisi. Maecenas interdum
      diam quis risus bibendum, eu fermentum est pharetra.
    </p>
    <p className="mb-3">
      Nunc congue magna eget eros blandit, eu viverra magna semper. Nullam in
      diam a metus dictum consequat. Quisque ultricies, ipsum non euismod semper,
      velit felis lacinia nibh, et finibus quam leo vitae nisi.
    </p>
    <p className="mb-0">
      Curabitur eget tincidunt elit. Nam et ligula finibus, eleifend velit et,
      commodo quam. Praesent non libero velit. Integer vel turpis purus. Etiam
      vehicula, nulla non fringilla blandit.
    </p>
  </>
);

export function ScrollablePage() {
  return (
    <DemoPageShell
      title="Scrollable Elements"
      subtitle="Scrollable containers with Architect size presets."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <DemoSection title="Medium Scrollable Area">
            <ScrollArea size="md">{paragraphs}</ScrollArea>
          </DemoSection>
          <DemoSection title="Large Scrollable Area">
            <ScrollArea size="lg">{paragraphs}</ScrollArea>
          </DemoSection>
        </div>
        <div>
          <DemoSection title="Small Scrollable Area">
            <ScrollArea size="sm">{paragraphs}</ScrollArea>
          </DemoSection>

          <Card className="main-card mb-3">
            <CardHeader className="justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold uppercase text-kit-heading">
                Header Menu
              </span>
              <div className="btn-actions-pane-right flex items-center">
                <Button variant="link" size="sm" className="mb-0 mr-0 px-2">
                  <Leaf className="h-4 w-4" />
                </Button>
                <Button variant="link" size="sm" className="mb-0 mr-0 px-2">
                  <CloudDownload className="h-4 w-4" />
                </Button>
                <Dropdown
                  variant="link"
                  size="sm"
                  className="mb-0 mr-0"
                  menuAlign="right"
                  trigger={<Menu className="h-4 w-4" />}
                  items={[
                    { type: "header", label: "Header" },
                    { type: "item", label: "Menus" },
                    { type: "item", label: "Settings" },
                    { type: "item", label: "Actions" },
                    { type: "divider" },
                    { type: "item", label: "View Details" },
                  ]}
                />
              </div>
            </CardHeader>
            <CardBody>
              <ScrollArea size="sm">{paragraphs}</ScrollArea>
            </CardBody>
            <CardFooter className="justify-end">
              <Button variant="link" size="sm" className="mb-0 me-2">
                Cancel
              </Button>
              <Button variant="success" size="lg" className="mb-0">
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DemoPageShell>
  );
}
