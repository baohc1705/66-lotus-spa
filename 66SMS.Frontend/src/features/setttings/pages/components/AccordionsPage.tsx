import { useState } from "react";
import { Accordion, Collapse } from "@/shared/components/Accordion";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/shared/elements/Card";
import { DemoPageShell } from "../../components/DemoPageShell";

const longText =
  "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.";

const accordionBody =
  "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.";

export function AccordionsPage() {
  const [collapseOpen, setCollapseOpen] = useState(false);

  return (
    <DemoPageShell
      title="Accordions"
      subtitle="Accordions represent collapsible content areas which can be triggered by clicking on their heading."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Card className="main-card mb-3">
            <CardBody>
              <CardTitle>Collapse</CardTitle>
              <Collapse open={collapseOpen}>
                <p className="mb-3">{longText}</p>
                <p className="mb-0">
                  Donec molestie odio id nisi malesuada, mattis tincidunt velit egestas. Sed non
                  pulvinar risus. Aenean elementum eleifend nunc, pellentesque dapibus arcu
                  hendrerit fringilla. Aliquam in nibh massa. Cras ultricies lorem non enim
                  volutpat, a eleifend urna placerat. Fusce id luctus urna. In sed leo tellus.
                  Mauris tristique leo a nisl feugiat, eget vehicula leo venenatis. Quisque magna
                  metus, luctus quis sollicitudin vel, vehicula nec ipsum.
                </p>
              </Collapse>
            </CardBody>
            <CardFooter>
              <Button
                variant="primary"
                className="mb-0"
                onClick={() => setCollapseOpen(!collapseOpen)}
              >
                Toggle
              </Button>
            </CardFooter>
          </Card>

          <Card className="main-card mb-3">
            <CardBody>
              <CardTitle>Simple</CardTitle>
              <Accordion
                items={[
                  {
                    id: "1",
                    title: "Toggle item",
                    content:
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium lorem non vestibulum scelerisque. Proin a vestibulum sem, eget tristique massa. Aliquam lacinia rhoncus nibh quis ornare.",
                  },
                  {
                    id: "2",
                    title: "Toggle item 2",
                    content:
                      "Donec at ipsum dignissim, rutrum turpis scelerisque, tristique lectus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>

        <Accordion
          wrapper
          items={[
            {
              id: "1",
              title: "Collapsible Group Item #1",
              content: "1. " + accordionBody,
            },
            {
              id: "2",
              title: "Collapsible Group Item #2",
              content: "2. " + accordionBody,
            },
            {
              id: "3",
              title: "Collapsible Group Item #3",
              content: "3. " + accordionBody,
            },
          ]}
        />
      </div>
    </DemoPageShell>
  );
}
