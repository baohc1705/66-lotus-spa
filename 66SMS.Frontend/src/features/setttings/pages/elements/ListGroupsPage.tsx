import { useState } from "react";
import { Badge } from "@/shared/elements/Badge";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

export function ListGroupsPage() {
  const [activeId, setActiveId] = useState(0);

  return (
    <DemoPageShell
      title="List Groups"
      subtitle="List groups are a flexible and powerful component for displaying a series of content."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <DemoSection title="List group">
          <ListGroup>
            <ListGroupItem>Cras justo odio</ListGroupItem>
            <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
            <ListGroupItem>Morbi leo risus</ListGroupItem>
            <ListGroupItem>Porta ac consectetur ac</ListGroupItem>
            <ListGroupItem>Vestibulum at eros</ListGroupItem>
          </ListGroup>
        </DemoSection>

        <DemoSection title="List group buttons">
          <ListGroup>
            {[
              "Cras justo odio",
              "Dapibus ac facilisis in",
              "Morbi leo risus",
              "Porta ac consectetur ac",
            ].map((label: string, index: number) => (
              <ListGroupItem
                key={label}
                action
                active={activeId === index}
                onClick={() => setActiveId(index)}
              >
                {label}
              </ListGroupItem>
            ))}
            <ListGroupItem action disabled>
              Vestibulum at eros
            </ListGroupItem>
          </ListGroup>
        </DemoSection>

        <DemoSection title="List group badges">
          <ListGroup>
            <ListGroupItem>
              Cras justo odio
              <Badge variant="secondary" pill>
                14
              </Badge>
            </ListGroupItem>
            <ListGroupItem>
              Dapibus ac facilisis in
              <Badge variant="secondary" pill>
                2
              </Badge>
            </ListGroupItem>
            <ListGroupItem>
              Morbi leo risus
              <Badge variant="secondary" pill>
                1
              </Badge>
            </ListGroupItem>
          </ListGroup>
        </DemoSection>

        <DemoSection title="List group contextual classes">
          <ListGroup>
            <ListGroupItem tone="primary">Primary</ListGroupItem>
            <ListGroupItem tone="secondary">Secondary</ListGroupItem>
            <ListGroupItem tone="success">Success</ListGroupItem>
            <ListGroupItem tone="info">Info</ListGroupItem>
            <ListGroupItem tone="warning">Warning</ListGroupItem>
            <ListGroupItem tone="danger">Danger</ListGroupItem>
            <ListGroupItem tone="focus">Focus</ListGroupItem>
            <ListGroupItem tone="alternate">Alternate</ListGroupItem>
          </ListGroup>
        </DemoSection>

        <DemoSection title="List group custom content">
          <ListGroup>
            <ListGroupItem active>
              <div>
                <h5 className="mb-1 text-sm font-normal">List group item heading</h5>
                <p className="mb-0 text-sm opacity-90">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                  varius blandit.
                </p>
              </div>
            </ListGroupItem>
            <ListGroupItem>
              <div>
                <h5 className="mb-1 text-sm font-normal text-kit-heading">
                  List group item heading
                </h5>
                <p className="mb-0 text-sm text-kit-muted">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                  varius blandit.
                </p>
              </div>
            </ListGroupItem>
            <ListGroupItem>
              <div>
                <h5 className="mb-1 text-sm font-normal text-kit-heading">
                  List group item heading
                </h5>
                <p className="mb-0 text-sm text-kit-muted">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus
                  varius blandit.
                </p>
              </div>
            </ListGroupItem>
          </ListGroup>
        </DemoSection>

        <DemoSection title="List group disabled items">
          <ListGroup>
            <ListGroupItem href="#" disabled>
              Cras justo odio
            </ListGroupItem>
            <ListGroupItem href="#">Dapibus ac facilisis in</ListGroupItem>
            <ListGroupItem href="#">Morbi leo risus</ListGroupItem>
            <ListGroupItem href="#">Porta ac consectetur ac</ListGroupItem>
            <ListGroupItem href="#">Vestibulum at eros</ListGroupItem>
          </ListGroup>
        </DemoSection>

        <DemoSection title="List group without border">
          <ListGroup flush>
            <ListGroupItem href="#" disabled>
              Cras justo odio
            </ListGroupItem>
            <ListGroupItem href="#">Dapibus ac facilisis in</ListGroupItem>
            <ListGroupItem href="#">Morbi leo risus</ListGroupItem>
            <ListGroupItem href="#">Porta ac consectetur ac</ListGroupItem>
            <ListGroupItem href="#">Vestibulum at eros</ListGroupItem>
          </ListGroup>
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
