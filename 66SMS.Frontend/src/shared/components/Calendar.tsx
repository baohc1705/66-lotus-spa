import { useState } from "react";
import { Scheduler } from "calendarkit-pro";
import type {
  CalendarEvent,
  CalendarTheme,
  CalendarTranslations,
  EventType,
  Resource,
  ViewType,
} from "calendarkit-pro";

export type {
  CalendarEvent,
  CalendarTheme,
  CalendarTranslations,
  EventType,
  Resource,
  ViewType,
};

const KIT_THEME: CalendarTheme = {
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

export type CalendarProps = {
  className?: string;
  events?: CalendarEvent[];
  view?: ViewType;
  defaultView?: ViewType;
  date?: Date;
  defaultDate?: Date;
  onViewChange?: (view: ViewType) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (event: Partial<CalendarEvent>) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDrop?: (event: CalendarEvent, start: Date, end: Date) => void;
  onEventResize?: (event: CalendarEvent, start: Date, end: Date) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  hideViewSwitcher?: boolean;
  language?: "en" | "fr";
  translations?: Partial<CalendarTranslations>;
  theme?: CalendarTheme;
  calendars?: {
    id: string;
    label: string;
    color?: string;
    active?: boolean;
  }[];
  resources?: Resource[];
  eventTypes?: EventType[];
  onCalendarToggle?: (calendarId: string, active: boolean) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
};

function mergeTheme(custom?: CalendarTheme): CalendarTheme {
  if (!custom) return KIT_THEME;
  return {
    fontFamily: custom.fontFamily ?? KIT_THEME.fontFamily,
    borderRadius: custom.borderRadius ?? KIT_THEME.borderRadius,
    colors: {
      ...KIT_THEME.colors,
      ...custom.colors,
    },
  };
}

export function Calendar({
  className = "",
  events,
  view,
  defaultView = "month",
  date,
  defaultDate,
  onViewChange,
  onDateChange,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onEventDrop,
  onEventResize,
  readOnly = false,
  isLoading = false,
  hideViewSwitcher = false,
  language = "en",
  translations,
  theme,
  calendars,
  resources,
  eventTypes,
  onCalendarToggle,
  isDarkMode,
  onThemeToggle,
}: CalendarProps) {
  const isEventsControlled = events !== undefined;
  const [innerEvents, setInnerEvents] = useState<CalendarEvent[]>(DEMO_EVENTS);
  const [innerView, setInnerView] = useState<ViewType>(defaultView);
  const [innerDate, setInnerDate] = useState<Date>(defaultDate ?? new Date());

  const currentEvents = isEventsControlled ? events : innerEvents;
  const currentView = view ?? innerView;
  const currentDate = date ?? innerDate;

  function handleViewChange(next: ViewType) {
    if (view === undefined) setInnerView(next);
    onViewChange?.(next);
  }

  function handleDateChange(next: Date) {
    if (date === undefined) setInnerDate(next);
    onDateChange?.(next);
  }

  function handleEventCreate(event: Partial<CalendarEvent>) {
    if (onEventCreate) {
      onEventCreate(event);
      return;
    }
    if (isEventsControlled || readOnly) return;
    setInnerEvents((prev: CalendarEvent[]) => [
      ...prev,
      { ...event, id: crypto.randomUUID() } as CalendarEvent,
    ]);
  }

  function handleEventUpdate(event: CalendarEvent) {
    if (onEventUpdate) {
      onEventUpdate(event);
      return;
    }
    if (isEventsControlled || readOnly) return;
    setInnerEvents((prev: CalendarEvent[]) =>
      prev.map((item: CalendarEvent) => (item.id === event.id ? event : item)),
    );
  }

  function handleEventDelete(eventId: string) {
    if (onEventDelete) {
      onEventDelete(eventId);
      return;
    }
    if (isEventsControlled || readOnly) return;
    setInnerEvents((prev: CalendarEvent[]) =>
      prev.filter((item: CalendarEvent) => item.id !== eventId),
    );
  }

  return (
    <div
      id="calendar"
      className={"font-sans text-sm text-kit-body " + className}
    >
      <Scheduler
        events={currentEvents}
        view={currentView}
        onViewChange={handleViewChange}
        date={currentDate}
        onDateChange={handleDateChange}
        readOnly={readOnly}
        isLoading={isLoading}
        hideViewSwitcher={hideViewSwitcher}
        language={language}
        translations={translations}
        theme={mergeTheme(theme)}
        calendars={calendars}
        resources={resources}
        eventTypes={eventTypes}
        onCalendarToggle={onCalendarToggle}
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        onEventClick={onEventClick}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
