import { Card, CardBody } from "@/shared/elements/Card";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Progress } from "@/shared/components/Progress";
import { StatCard } from "@/shared/widgets/StatCard";
import {
  WidgetBox,
  WidgetContentLeft,
  WidgetContentOuter,
  WidgetContentRight,
  WidgetContentWrapper,
  WidgetDivider,
  WidgetHeading,
  WidgetNumbers,
  WidgetProgressLabels,
  WidgetSubheading,
} from "@/shared/widgets/WidgetContent";
import { DemoPageShell } from "../../components/DemoPageShell";

function InlineStat(props: {
  title: string;
  description: string;
  value: string;
  valueTone: "success" | "primary" | "warning" | "danger";
  numberFirst?: boolean;
  progress?: {
    value: number;
    tone?: "primary" | "success" | "warning" | "danger";
    size?: "xs" | "sm" | "lg";
    animated?: boolean;
    leftLabel: string;
    rightLabel?: string;
  };
  className?: string;
}) {
  const heading = (
    <WidgetContentLeft>
      <WidgetHeading>{props.title}</WidgetHeading>
      <WidgetSubheading>{props.description}</WidgetSubheading>
    </WidgetContentLeft>
  );
  const numbers = (
    <WidgetContentRight push={!props.numberFirst} className={props.numberFirst ? "mr-3" : undefined}>
      <WidgetNumbers tone={props.valueTone}>{props.value}</WidgetNumbers>
    </WidgetContentRight>
  );

  return (
    <div className={"p-4 " + (props.className ?? "")}>
      <WidgetContentOuter>
        <WidgetContentWrapper>
          {props.numberFirst ? (
            <>
              {numbers}
              {heading}
            </>
          ) : (
            <>
              {heading}
              {numbers}
            </>
          )}
        </WidgetContentWrapper>
        {props.progress ? (
          <div className="mt-4">
            <Progress
              value={props.progress.value}
              tone={props.progress.tone ?? "primary"}
              size={props.progress.size ?? "sm"}
              animated={props.progress.animated}
              className="mb-0"
            />
            <WidgetProgressLabels
              left={props.progress.leftLabel}
              right={props.progress.rightLabel ?? "100%"}
            />
          </div>
        ) : null}
      </WidgetContentOuter>
    </div>
  );
}

function ListStat(props: {
  title: string;
  description: string;
  value: string;
  valueTone: "success" | "primary" | "warning" | "danger";
  progress?: {
    value: number;
    tone?: "primary" | "success" | "warning" | "danger";
    size?: "xs" | "sm" | "lg";
    animated?: boolean;
    leftLabel: string;
  };
}) {
  return (
    <div className="w-full p-0">
      <WidgetContentOuter>
        <WidgetContentWrapper>
          <WidgetContentLeft>
            <WidgetHeading>{props.title}</WidgetHeading>
            <WidgetSubheading>{props.description}</WidgetSubheading>
          </WidgetContentLeft>
          <WidgetContentRight>
            <WidgetNumbers tone={props.valueTone}>{props.value}</WidgetNumbers>
          </WidgetContentRight>
        </WidgetContentWrapper>
        {props.progress ? (
          <div className="mt-4">
            <Progress
              value={props.progress.value}
              tone={props.progress.tone ?? "primary"}
              size={props.progress.size ?? "xs"}
              animated={props.progress.animated}
              className="mb-0"
            />
            <WidgetProgressLabels left={props.progress.leftLabel} right="100%" />
          </div>
        ) : null}
      </WidgetContentOuter>
    </div>
  );
}

function TargetChartBlock(props: {
  value: number;
  label: string;
  tone: "danger" | "success" | "warning" | "info";
}) {
  return (
    <WidgetBox shadowTone={props.tone} className="text-left">
      <WidgetContentOuter>
        <WidgetContentWrapper>
          <WidgetContentLeft className="shrink-0 pr-2 text-base">
            <WidgetNumbers tone={props.tone} size="md" className="mt-0">
              {props.value}%
            </WidgetNumbers>
          </WidgetContentLeft>
          <div className="widget-content-right min-w-0 w-full">
            <Progress value={props.value} tone={props.tone} size="xs" className="mb-0" />
          </div>
        </WidgetContentWrapper>
        <WidgetContentLeft className="text-base">
          <div className="text-kit-muted opacity-60">{props.label}</div>
        </WidgetContentLeft>
      </WidgetContentOuter>
    </WidgetBox>
  );
}

export function BoxesPage() {
  return (
    <DemoPageShell
      title="Dashboard Boxes"
      subtitle="Highly configurable boxes best used for showing numbers in an user friendly way."
    >
      <div className="grid gap-x-6 lg:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="success"
        />
        <StatCard
          title="Clients"
          description="Total Clients Profit"
          value="$ 568"
          valueTone="primary"
        />
        <StatCard
          title="Products Sold"
          description="Total revenue streams"
          value="$14M"
          valueTone="warning"
        />
        <StatCard
          title="Followers"
          description="People Interested"
          value="46%"
          valueTone="danger"
        />
      </div>

      <WidgetDivider />

      <div className="grid gap-x-6 lg:grid-cols-2 xl:grid-cols-3">
        <StatCard
          tone="night-fade"
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="white"
        />
        <StatCard
          tone="arielle-smile"
          title="Clients"
          description="Total Clients Profit"
          value="$ 568"
          valueTone="white"
        />
        <StatCard
          tone="premium-dark"
          title="Products Sold"
          description="Total revenue streams"
          value="$14M"
          valueTone="warning"
        />
        <StatCard
          tone="happy-green"
          title="Followers"
          description="People Interested"
          value="46%"
          valueTone="dark"
        />
      </div>

      <WidgetDivider />

      <div className="grid gap-x-6 lg:grid-cols-2 xl:grid-cols-3">
        <StatCard
          tone="love-kiss"
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="white"
        />
        <StatCard
          tone="grow-early"
          title="Clients"
          description="Total Clients Profit"
          value="$ 568"
          valueTone="white"
        />
        <StatCard
          tone="tempting-azure"
          title="Products Sold"
          description="Total revenue streams"
          value="$14M"
          valueTone="dark"
        />
        <StatCard
          tone="mean-fruit"
          title="Followers"
          description="People Interested"
          value="46%"
          valueTone="white"
        />
        <StatCard
          tone="midnight-bloom"
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="white"
        />
        <StatCard
          tone="mixed-hopes"
          title="Clients"
          description="Total Clients Profit"
          value="$ 568"
          valueTone="white"
        />
        <StatCard
          tone="sunny-morning"
          title="Products Sold"
          description="Total revenue streams"
          value="$14M"
          valueTone="dark"
        />
        <StatCard
          tone="ripe-malin"
          title="Followers"
          description="People Interested"
          value="46%"
          valueTone="white"
        />
      </div>

      <WidgetDivider />

      <div className="grid gap-x-6 lg:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Orders"
          description="Last year expenses"
          value="1896"
          valueTone="success"
          progress={{
            value: 65,
            tone: "primary",
            size: "xs",
            leftLabel: "YoY Growth",
            rightLabel: "100%",
          }}
        />
        <StatCard
          title="Clients"
          description="Total Clients Profit"
          value="$12.6k"
          valueTone="primary"
          progress={{
            value: 47,
            tone: "warning",
            size: "lg",
            animated: true,
            leftLabel: "Retention",
            rightLabel: "100%",
          }}
        />
        <StatCard
          title="Products Sold"
          description="Total revenue streams"
          value="$3M"
          valueTone="warning"
          progress={{
            value: 85,
            tone: "danger",
            size: "xs",
            animated: true,
            leftLabel: "Sales",
            rightLabel: "100%",
          }}
        />
        <StatCard
          title="Followers"
          description="People Interested"
          value="45,9%"
          valueTone="danger"
          progress={{
            value: 65,
            tone: "success",
            size: "sm",
            animated: true,
            leftLabel: "Twitter Progress",
            rightLabel: "100%",
          }}
        />
      </div>

      <WidgetDivider />

      <div className="mb-3 rounded bg-kit-white shadow-kit-card">
        <div className="grid md:grid-cols-3">
          <InlineStat
            title="Total Orders"
            description="Last year expenses"
            value="1896"
            valueTone="success"
            numberFirst
          />
          <InlineStat
            title="Products Sold"
            description="Total revenue streams"
            value="$ 14M"
            valueTone="warning"
            numberFirst
          />
          <InlineStat
            title="Followers"
            description="People Interested"
            value="45.9%"
            valueTone="danger"
            numberFirst
          />
        </div>
      </div>

      <WidgetDivider />

      <div className="mb-3 overflow-hidden rounded bg-kit-white shadow-kit-card">
        <div className="grid md:grid-cols-3">
          <CardBody className="!py-0">
            <ListGroup flush>
              <ListGroupItem className="!block">
                <ListStat
                  title="Total Orders"
                  description="Last year expenses"
                  value="1896"
                  valueTone="success"
                />
              </ListGroupItem>
              <ListGroupItem className="!block">
                <ListStat
                  title="Clients"
                  description="Total Clients Profit"
                  value="$12.6k"
                  valueTone="primary"
                />
              </ListGroupItem>
            </ListGroup>
          </CardBody>
          <CardBody className="!py-0">
            <ListGroup flush>
              <ListGroupItem className="!block">
                <ListStat
                  title="Followers"
                  description="People Interested"
                  value="45,9%"
                  valueTone="danger"
                />
              </ListGroupItem>
              <ListGroupItem className="!block">
                <ListStat
                  title="Products Sold"
                  description="Total revenue streams"
                  value="$3M"
                  valueTone="warning"
                />
              </ListGroupItem>
            </ListGroup>
          </CardBody>
          <CardBody className="!py-0">
            <ListGroup flush>
              <ListGroupItem className="!block">
                <ListStat
                  title="Total Orders"
                  description="Last year expenses"
                  value="1896"
                  valueTone="success"
                />
              </ListGroupItem>
              <ListGroupItem className="!block">
                <ListStat
                  title="Clients"
                  description="Total Clients Profit"
                  value="$12.6k"
                  valueTone="primary"
                />
              </ListGroupItem>
            </ListGroup>
          </CardBody>
        </div>
      </div>

      <WidgetDivider />

      <div className="mb-3 rounded bg-kit-white shadow-kit-card">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3">
          <InlineStat
            title="Total Orders"
            description="Last year expenses"
            value="1896"
            valueTone="success"
            progress={{
              value: 43,
              tone: "primary",
              size: "sm",
              animated: true,
              leftLabel: "YoY Growth",
            }}
          />
          <InlineStat
            title="Clients"
            description="Total Clients Profit"
            value="$12.6k"
            valueTone="primary"
            progress={{
              value: 47,
              tone: "warning",
              size: "sm",
              animated: true,
              leftLabel: "Retention",
            }}
          />
          <InlineStat
            title="Products Sold"
            description="Total revenue streams"
            value="$3M"
            valueTone="warning"
            progress={{
              value: 77,
              tone: "danger",
              size: "sm",
              animated: true,
              leftLabel: "Sales",
            }}
          />
          <InlineStat
            title="Followers"
            description="People Interested"
            value="45,9%"
            valueTone="danger"
            progress={{
              value: 65,
              tone: "success",
              size: "sm",
              animated: true,
              leftLabel: "Twitter Progress",
            }}
          />
        </div>
      </div>

      <WidgetDivider />

      <div className="mb-3 rounded bg-kit-white shadow-kit-card">
        <div className="grid md:grid-cols-3">
          <InlineStat
            title="Total Orders"
            description="Last year expenses"
            value="1896"
            valueTone="success"
            progress={{
              value: 43,
              tone: "primary",
              size: "sm",
              animated: true,
              leftLabel: "YoY Growth",
            }}
          />
          <InlineStat
            title="Products Sold"
            description="Total revenue streams"
            value="$3M"
            valueTone="warning"
            progress={{
              value: 77,
              tone: "danger",
              size: "sm",
              animated: true,
              leftLabel: "Sales",
            }}
          />
          <InlineStat
            title="Followers"
            description="People Interested"
            value="45,9%"
            valueTone="danger"
            progress={{
              value: 65,
              tone: "success",
              size: "sm",
              animated: true,
              leftLabel: "Twitter Progress",
            }}
          />
        </div>
      </div>

      <WidgetDivider />

      <div className="grid gap-x-6 md:grid-cols-2">
        <div className="mb-3 overflow-hidden rounded bg-kit-white shadow-kit-card">
          <ListGroup flush>
            <ListGroupItem className="!block">
              <ListStat
                title="Total Orders"
                description="Last year expenses"
                value="1896"
                valueTone="success"
                progress={{
                  value: 65,
                  tone: "primary",
                  size: "xs",
                  leftLabel: "YoY Growth",
                }}
              />
            </ListGroupItem>
            <ListGroupItem className="!block">
              <ListStat
                title="Clients"
                description="Total Clients Profit"
                value="$12.6k"
                valueTone="primary"
                progress={{
                  value: 47,
                  tone: "warning",
                  size: "lg",
                  animated: true,
                  leftLabel: "Retention",
                }}
              />
            </ListGroupItem>
            <ListGroupItem className="!block">
              <ListStat
                title="Followers"
                description="People Interested"
                value="45,9%"
                valueTone="danger"
                progress={{
                  value: 65,
                  tone: "success",
                  size: "sm",
                  animated: true,
                  leftLabel: "Twitter Progress",
                }}
              />
            </ListGroupItem>
          </ListGroup>
        </div>

        <Card>
          <CardBody>
            <ListGroup>
              <ListGroupItem className="!block">
                <ListStat
                  title="Total Orders"
                  description="Last year expenses"
                  value="1896"
                  valueTone="success"
                />
              </ListGroupItem>
              <ListGroupItem className="!block">
                <ListStat
                  title="Clients"
                  description="Total Clients Profit"
                  value="$12.6k"
                  valueTone="primary"
                />
              </ListGroupItem>
              <ListGroupItem className="!block">
                <ListStat
                  title="Followers"
                  description="People Interested"
                  value="45,9%"
                  valueTone="danger"
                />
              </ListGroupItem>
              <ListGroupItem className="!block">
                <ListStat
                  title="Products Sold"
                  description="Total revenue streams"
                  value="$3M"
                  valueTone="warning"
                />
              </ListGroupItem>
            </ListGroup>
          </CardBody>
        </Card>
      </div>

      <WidgetDivider />

      <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
        <TargetChartBlock value={71} label="Income Target" tone="danger" />
        <TargetChartBlock value={54} label="Expenses Target" tone="success" />
        <TargetChartBlock value={32} label="Spendings Target" tone="warning" />
        <TargetChartBlock value={89} label="Totals Target" tone="info" />
      </div>
    </DemoPageShell>
  );
}
