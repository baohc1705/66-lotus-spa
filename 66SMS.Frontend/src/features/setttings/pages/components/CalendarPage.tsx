import { Calendar } from "@/shared/components/Calendar";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

export function CalendarPage() {
  return (
    <DemoPageShell
      title="Calendar"
      subtitle="Calendars are used for date selection and schedule overview."
    >
      <DemoSection title="Basic Calendar">
        <Calendar />
      </DemoSection>
    </DemoPageShell>
  );
}
