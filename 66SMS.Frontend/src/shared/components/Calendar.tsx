import { useState } from "react";
import { Scheduler } from "calendarkit-pro";
import type { CalendarEvent, ViewType } from "calendarkit-pro";

type CalendarProps = {
  className?: string;
  initialDate?: Date;
  events?: CalendarEvent[];
  readOnly?: boolean;
};

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "All Day Event",
    start: new Date(2023, 0, 1),
    end: new Date(2023, 0, 1, 23, 59),
    allDay: true,
  },
  {
    id: "2",
    title: "Long Event",
    start: new Date(2023, 0, 7),
    end: new Date(2023, 0, 10),
    allDay: true,
  },
  {
    id: "3",
    title: "Meeting",
    start: new Date(2023, 0, 12, 10, 30),
    end: new Date(2023, 0, 12, 12, 30),
  },
  {
    id: "4",
    title: "Lunch",
    start: new Date(2023, 0, 12, 12, 0),
    end: new Date(2023, 0, 12, 13, 0),
  },
  {
    id: "5",
    title: "Conference",
    start: new Date(2023, 0, 11, 9, 0),
    end: new Date(2023, 0, 13, 17, 0),
  },
  {
    id: "6",
    title: "Birthday Party",
    start: new Date(2023, 0, 13, 7, 0),
    end: new Date(2023, 0, 13, 9, 0),
  },
];

export function Calendar({
  className = "",
  initialDate = new Date(2023, 0, 12),
  events: initialEvents,
  readOnly = false,
}: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(
    initialEvents ?? DEMO_EVENTS
  );
  const [view, setView] = useState<ViewType>("month");
  const [date, setDate] = useState<Date>(initialDate);

  return (
    <div id="calendar" className={"font-sans text-sm text-kit-body " + className}>
      <Scheduler
        events={events}
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        readOnly={readOnly}
        language="en"
        theme={{
          fontFamily: "inherit",
          borderRadius: "0.375rem",
          colors: {
            primary: "var(--kit-primary)",
            secondary: "var(--kit-secondary)",
            background: "var(--kit-white)",
            foreground: "var(--kit-heading)",
            border: "var(--kit-border)",
            muted: "var(--kit-page)",
            accent: "var(--kit-soft-primary-bg)",
          },
        }}
        onEventCreate={(event) => {
          setEvents((prev: CalendarEvent[]) => [
            ...prev,
            { ...event, id: crypto.randomUUID() } as CalendarEvent,
          ]);
        }}
        onEventUpdate={(event: CalendarEvent) => {
          setEvents((prev: CalendarEvent[]) =>
            prev.map((item: CalendarEvent) => (item.id === event.id ? event : item))
          );
        }}
        onEventDelete={(id: string) => {
          setEvents((prev: CalendarEvent[]) =>
            prev.filter((item: CalendarEvent) => item.id !== id)
          );
        }}
      />
    </div>
  );
}

export type { CalendarEvent, ViewType };
