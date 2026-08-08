import { BodyTabs } from "@/shared/components/Tabs";
import { Calendar } from "@/shared/components/Calendar";
import { Card, CardBody } from "@/shared/elements/Card";
import { DemoPageShell } from "../../components/DemoPageShell";

export function CalendarPage() {
  return (
    <DemoPageShell
      title="Calendar"
      subtitle="Calendars are used for date selection and schedule overview."
    >
      <BodyTabs
        items={[{ id: "basic", label: "Basic Calendar" }]}
        activeId="basic"
        onChange={() => {}}
      />

      <Card className="main-card mb-3">
        <CardBody>
          <Calendar />
        </CardBody>
      </Card>
    </DemoPageShell>
  );
}
