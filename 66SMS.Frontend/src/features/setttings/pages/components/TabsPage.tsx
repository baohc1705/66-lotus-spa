import { useState, type ReactNode } from "react";
import {
  BodyTabs,
  TabNav,
  type TabNavVariant,
} from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/elements/Card";
import { DemoPageShell, HeaderIcon } from "../../components/DemoPageShell";

const T1 =
  "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
const T2 =
  "Like Aldus PageMaker including versions of Lorem. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";
const T3 =
  "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";
const T4 =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";
const T5 =
  "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";
const T6 =
  "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

const labels3 = [
  { id: "0", label: "Tab 1" },
  { id: "1", label: "Tab 2" },
  { id: "2", label: "Tab 3" },
];
const pills3 = [
  { id: "0", label: "Pill 1" },
  { id: "1", label: "Pill 2" },
  { id: "2", label: "Pill 3" },
];

function DemoTabCard(props: {
  title?: string;
  titleClassName?: string;
  headerGradient?: "plum-plate" | "mixed-hopes" | "grow-early" | "love-kiss";
  tabVariant: TabNavVariant;
  texts: string[];
  labels?: { id: string; label: string }[];
  tabsInHeader?: boolean;
  headerOnlyTabs?: boolean;
  headerTabAnimation?: boolean;
  centerFooter?: boolean;
  footer?: ReactNode;
}) {
  const [activeId, setActiveId] = useState("0");
  const labels = props.labels ?? labels3;
  const activeIndex = Number(activeId) || 0;
  const nav = (
    <TabNav
      items={labels}
      activeId={activeId}
      onChange={setActiveId}
      variant={props.tabVariant}
    />
  );

  const headerClass =
    "h-auto min-h-14 justify-between gap-3 py-0 " +
    (props.headerTabAnimation ? "card-header-tab-animation " : "") +
    (props.tabsInHeader && !props.headerOnlyTabs ? "card-header-tab " : "");

  return (
    <Card className="main-card mb-3">
      {props.tabsInHeader || props.headerOnlyTabs ? (
        <CardHeader className={headerClass}>
          {props.title && !props.headerOnlyTabs ? (
            <div
              className={
                "card-header-title flex items-center whitespace-nowrap text-sm font-bold uppercase text-[rgba(36,59,107,0.7)] " +
                (props.titleClassName ?? "")
              }
            >
              {props.headerGradient ? <HeaderIcon gradient={props.headerGradient} /> : null}
              {props.title}
            </div>
          ) : null}
          <div className={props.tabsInHeader && !props.headerOnlyTabs ? "btn-actions-pane-right ml-auto" : "w-full"}>
            {nav}
          </div>
        </CardHeader>
      ) : null}

      <CardBody>
        {!props.tabsInHeader && !props.headerOnlyTabs ? (
          <>
            {props.title ? <CardTitle>{props.title}</CardTitle> : null}
            {nav}
          </>
        ) : null}
        <div className="tab-content">
          <p className="mb-0">{props.texts[activeIndex]}</p>
        </div>
      </CardBody>

      {props.footer ? (
        <CardFooter
          className={
            "d-block " + (props.centerFooter ? "justify-center text-center" : "justify-end text-end")
          }
        >
          {props.footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function CardTabsSection() {
  return (
    <div className="row grid gap-0 md:grid-cols-2 md:gap-4">
      <div>
        <DemoTabCard
          title="Header with Tabs"
          headerGradient="plum-plate"
          tabVariant="btn-group-primary"
          tabsInHeader
          texts={[T1, T2, T3]}
          footer={
            <Button variant="success" wide className="mb-0">
              Save
            </Button>
          }
        />
        <DemoTabCard
          title="Header Tabs Buttons"
          headerGradient="plum-plate"
          tabVariant="btn-outline-alternate-pill"
          tabsInHeader
          texts={[T1, T2, T3]}
          footer={
            <Button variant="success" wide className="mb-0">
              Save
            </Button>
          }
        />
        <DemoTabCard
          title="Alternate Tabs"
          headerGradient="mixed-hopes"
          tabVariant="btn-focus-group"
          tabsInHeader
          texts={[T1, T2, T3]}
        />
        <DemoTabCard
          title="Header Tabs Standard Buttons"
          headerGradient="grow-early"
          tabVariant="btn-outline-danger-pill"
          tabsInHeader
          texts={[T1, T2, T3]}
          footer={
            <Button variant="success" wide className="mb-0">
              Save
            </Button>
          }
        />
      </div>
      <div>
        <DemoTabCard
          title="Header Alternate Tabs"
          headerGradient="love-kiss"
          tabVariant="nav-link-header"
          tabsInHeader
          texts={[T1, T2, T3]}
          footer={
            <Button variant="danger" wide shadow className="mb-0">
              Delete
            </Button>
          }
        />
        <DemoTabCard
          title="Header Tabs Standard Buttons"
          headerGradient="grow-early"
          tabVariant="btn-outline-primary"
          tabsInHeader
          texts={[T1, T2, T3]}
          footer={
            <Button variant="success" wide className="mb-0">
              Save
            </Button>
          }
        />
        <DemoTabCard
          tabVariant="nav-justified"
          headerOnlyTabs
          texts={[T1, T2, T3]}
        />
      </div>
    </div>
  );
}

function AnimatedLinesSection() {
  return (
    <div className="row grid gap-0 md:grid-cols-2 md:gap-4">
      <div>
        <DemoTabCard tabVariant="animated-shadow" texts={[T5, T4, T6]} />
        <DemoTabCard
          tabVariant="nav-justified"
          headerOnlyTabs
          headerTabAnimation
          texts={[T1, T2, T3]}
        />
      </div>
      <div>
        <DemoTabCard
          tabVariant="animated-shadow-justified"
          texts={[T5, T4, T6]}
        />
        <DemoTabCard
          title="Tabs Alternate Animation"
          titleClassName="!normal-case !font-normal text-lg"
          headerGradient="love-kiss"
          tabVariant="nav-link-header"
          tabsInHeader
          headerTabAnimation
          centerFooter
          texts={[T1, T2, T3]}
          footer={
            <>
              <Button variant="link" wide className="mb-0">
                Link Button
              </Button>
              <Button variant="danger" wide shadow className="mb-0">
                Delete
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

function BasicSection() {
  return (
    <div className="row grid gap-0 md:grid-cols-2 md:gap-4">
      <div>
        <DemoTabCard title="Basic" tabVariant="nav-tabs" texts={[T1, T4, T3]} />
        <DemoTabCard
          title="Justified Alignment"
          tabVariant="nav-tabs-justified"
          texts={[T1, T4, T3]}
        />
        <DemoTabCard
          title="Tabs Variations"
          tabVariant="btn-warning-group"
          texts={[T1, T4, T3]}
        />
      </div>
      <div>
        <DemoTabCard
          title="Pills"
          tabVariant="nav-pills"
          labels={pills3}
          texts={[T1, T4, T3]}
        />
        <DemoTabCard
          title="Pills"
          tabVariant="nav-pills-fill"
          labels={pills3}
          texts={[T1, T4, T3]}
        />
        <DemoTabCard
          title="Button Group Tabs"
          tabVariant="btn-group-primary-center"
          texts={[T1, T3, T3]}
        />
      </div>
    </div>
  );
}

export function TabsPage() {
  const [section, setSection] = useState("card");

  return (
    <DemoPageShell
      title="Tabs"
      subtitle="Tabs are used to split content between multiple sections. Wide variety available."
    >
      <BodyTabs
        items={[
          { id: "card", label: "Card Tabs" },
          { id: "lines", label: "Animated Lines" },
          { id: "basic", label: "Basic" },
        ]}
        activeId={section}
        onChange={setSection}
      />
      {section === "card" ? <CardTabsSection /> : null}
      {section === "lines" ? <AnimatedLinesSection /> : null}
      {section === "basic" ? <BasicSection /> : null}
    </DemoPageShell>
  );
}
