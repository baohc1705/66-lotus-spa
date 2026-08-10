import { useState } from "react";
import { BodyTabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "@/shared/elements/Card";
import { DemoPageShell } from "../../components/DemoPageShell";

const colorTones = [
  "primary",
  "secondary",
  "warning",
  "danger",
  "success",
  "info",
  "focus",
  "alternate",
] as const;

export function CardsPage() {
  const [tab, setTab] = useState("basic");

  return (
    <DemoPageShell
      title="Cards"
      subtitle="Wide selection of cards with multiple styles, borders, actions and hover effects."
    >
      <BodyTabs
        items={[
          { id: "basic", label: "Basic" },
          { id: "colors", label: "Color States" },
        ]}
        activeId={tab}
        onChange={setTab}
      />

      {tab === "basic" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Card>
              <CardBody>
                <CardTitle>Basic Example</CardTitle>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                  commodo ligula eget dolor. Aenean massa.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Card with Subtitle</CardTitle>
                <CardSubtitle>
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit
                </CardSubtitle>
                <p className="text-sm">
                  Donec quam felis, ultricies nec, pellentesque eu, pretium quis,
                  sem. Nulla consequat massa quis eni
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Special Title Treatment</CardTitle>
                <p className="mb-3 text-sm">
                  With supporting text below as a natural lead-in to additional
                  content.
                </p>
                <Button variant="primary">Go somewhere</Button>
              </CardBody>
            </Card>
            <Card className="text-center">
              <CardBody>
                <CardTitle>Special Title Treatment</CardTitle>
                <p className="mb-3 text-sm">
                  With supporting text below as a natural lead-in to additional
                  content.
                </p>
                <Button variant="danger">Go somewhere</Button>
              </CardBody>
            </Card>
            <Card className="text-right">
              <CardBody>
                <CardTitle>Special Title Treatment</CardTitle>
                <p className="mb-3 text-sm">
                  With supporting text below as a natural lead-in to additional
                  content.
                </p>
                <Button variant="outline-focus">Go somewhere</Button>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Header</CardHeader>
              <CardBody>
                <CardTitle>Special Title Treatment</CardTitle>
                <p className="mb-3 text-sm">
                  With supporting text below as a natural lead-in to additional
                  content.
                </p>
                <Button variant="warning">Go somewhere</Button>
              </CardBody>
              <CardFooter>Footer</CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardBody>
                <CardTitle>Card title</CardTitle>
                <CardSubtitle>Card subtitle</CardSubtitle>
                <p className="mb-3 text-sm">
                  Some quick example text to build on the card title and make up
                  the bulk of the card&apos;s content.
                </p>
                <Button variant="secondary">Button</Button>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Card Title</CardTitle>
                <p className="mb-2 text-sm">
                  This is a wider card with supporting text below as a natural
                  lead-in to additional content. This content is a little bit
                  longer.
                </p>
                <small className="text-kit-muted">Last updated 3 mins ago</small>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardBody>
                <CardTitle>Card title</CardTitle>
                <CardSubtitle className="mb-0">Card subtitle</CardSubtitle>
              </CardBody>
              <CardBody>
                <p className="mb-2 text-sm">
                  Some quick example text to build on the card title and make up
                  the bulk of the card&apos;s content.
                </p>
                <a
                  href="#"
                  className="mr-3 text-sm text-kit-primary hover:underline"
                >
                  Card Link
                </a>
                <a href="#" className="text-sm text-kit-primary hover:underline">
                  Another Link
                </a>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Card Title</CardTitle>
                <p className="mb-2 text-sm">
                  This is a wider card with supporting text below as a natural
                  lead-in to additional content. This content is a little bit
                  longer.
                </p>
                <small className="text-kit-muted">Last updated 3 mins ago</small>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            {colorTones.map((tone) => (
              <Card key={"shadow-" + tone} borderTone={tone} shadowTone={tone}>
                <CardBody>
                  <CardTitle>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)} Card Shadow
                  </CardTitle>
                  <p className="text-sm">
                    With supporting text below as a natural lead-in to additional
                    content.
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
          <div>
            {colorTones.map((tone) => (
              <Card key={"border-" + tone} borderTone={tone}>
                <CardBody>
                  <CardTitle>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)} Card Border
                  </CardTitle>
                  <p className="text-sm">
                    With supporting text below as a natural lead-in to additional
                    content.
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
          <div>
            <Card tone="primary">
              <CardHeader className="border-white/20">Header</CardHeader>
              <CardBody>
                With supporting text below as a natural lead-in to additional
                content.
              </CardBody>
              <CardFooter className="border-white/20">Footer</CardFooter>
            </Card>
            <Card tone="dark">
              <CardBody>
                <CardTitle className="text-white">Special Title Treatment</CardTitle>
                With supporting text below as a natural lead-in to additional
                content.
              </CardBody>
            </Card>
            {(["primary", "success", "danger", "info", "warning"] as const).map(
              (tone) => (
                <Card key={"bg-" + tone} tone={tone}>
                  <CardBody>
                    <CardTitle className={tone === "warning" ? "" : "text-white"}>
                      Special Title Treatment
                    </CardTitle>
                    With supporting text below as a natural lead-in to additional
                    content.
                  </CardBody>
                </Card>
              ),
            )}
          </div>
        </div>
      )}
    </DemoPageShell>
  );
}
