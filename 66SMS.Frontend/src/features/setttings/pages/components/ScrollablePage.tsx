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
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sodales ullamcorper
      vehicula. Duis placerat quam porta lorem lobortis, sit amet sodales mauris finibus. Donec
      posuere diam at volutpat viverra. Cras fringilla auctor augue sed congue. Maecenas mollis quis
      enim quis egestas. In sollicitudin mi a pretium varius. Integer eleifend sodales pharetra.
    </p>
    <p className="mb-3">
      Nunc congue magna eget eros blandit, eu viverra magna semper. Nullam in diam a metus dictum
      consequat. Quisque ultricies, ipsum non euismod semper, velit felis lacinia nibh, et finibus
      quam leo vitae nisi. Maecenas interdum diam quis risus bibendum, eu fermentum est pharetra.
    </p>
    <p className="mb-3">
      Nunc congue magna eget eros blandit, eu viverra magna semper. Nullam in diam a metus dictum
      consequat. Quisque ultricies, ipsum non euismod semper, velit felis lacinia nibh, et finibus
      quam leo vitae nisi.
    </p>
    <p className="mb-0">
      Curabitur eget tincidunt elit. Nam et ligula finibus, eleifend velit et, commodo quam. Praesent
      non libero velit. Integer vel turpis purus. Etiam vehicula, nulla non fringilla blandit.
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
              <span className="flex items-center gap-2 text-sm font-bold uppercase text-[rgba(36,59,107,0.7)]">
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
                >
                  <div className="px-4 py-1.5 text-xs font-bold uppercase text-[#6c757d]">
                    Header
                  </div>
                  <button
                    type="button"
                    className="block w-full px-4 py-1.5 text-left text-sm text-[#495057] hover:bg-[#e0f3ff] hover:text-[#3f6ad8]"
                  >
                    Menus
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-1.5 text-left text-sm text-[#495057] hover:bg-[#e0f3ff] hover:text-[#3f6ad8]"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-1.5 text-left text-sm text-[#495057] hover:bg-[#e0f3ff] hover:text-[#3f6ad8]"
                  >
                    Actions
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <div className="flex justify-end gap-2 p-3">
                    <Button variant="link" size="sm" className="mb-0">
                      View Details
                    </Button>
                    <Button variant="primary" size="sm" className="mb-0">
                      Action
                    </Button>
                  </div>
                </Dropdown>
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
