import { useEffect, useRef, useState, type CSSProperties } from "react";
import { vi } from "date-fns/locale";
import type { Locale } from "date-fns";
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

const VI_LOCALE: Locale = { ...vi, code: "fr" };

const WEEKDAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const ENGLISH_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const VI_TRANSLATIONS: Partial<CalendarTranslations> & {
  calendars?: string;
  create?: string;
  localTime?: string;
} = {
  today: "Hôm nay",
  month: "Tháng",
  week: "Tuần",
  day: "Ngày",
  agenda: "Lịch trình",
  resource: "Tài nguyên",
  createEvent: "Tạo sự kiện",
  editEvent: "Sửa sự kiện",
  delete: "Xóa",
  save: "Lưu",
  cancel: "Hủy",
  title: "Tiêu đề",
  start: "Bắt đầu",
  end: "Kết thúc",
  allDay: "Cả ngày",
  description: "Mô tả",
  repeat: "Lặp lại",
  noRepeat: "Không lặp lại",
  selectCalendar: "Chọn lịch",
  selectType: "Chọn loại",
  daily: "Hàng ngày",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  yearly: "Hàng năm",
  event: "Sự kiện",
  task: "Công việc",
  appointmentSchedule: "Lịch hẹn",
  new: "Mới",
  dateAndTime: "Ngày và giờ",
  timezone: "Múi giờ",
  whosJoining: "Người tham gia",
  suggestedTimes: "Giờ gợi ý",
  viewSuggestions: "Xem gợi ý",
  whereWillItBe: "Địa điểm",
  location: "Vị trí",
  descriptionAndAttachments: "Mô tả và đính kèm",
  dragAndDrop: "Kéo thả",
  guests: "Khách",
  addAttachment: "Thêm đính kèm",
  moreOptions: "Thêm tùy chọn",
  doesNotRepeat: "Không lặp lại",
  locationHelpText: "Nhập địa điểm",
  calendars: "Lịch",
  create: "Tạo",
  localTime: "Giờ địa phương",
};

function parseEnglishMonthTitle(text: string): Date | null {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const monthIndex = ENGLISH_MONTHS.indexOf(parts[0].toLowerCase());
  const year = Number(parts[1]);
  if (monthIndex < 0 || Number.isNaN(year)) return null;
  return new Date(year, monthIndex, 1);
}

function localizeMiniCalendar(root: HTMLElement) {
  const monthTitle = root.querySelector(
    "span.text-sm.font-semibold.capitalize",
  ) as HTMLElement | null;

  if (monthTitle) {
    const raw = monthTitle.textContent?.trim() ?? "";
    if (!raw.startsWith("Tháng")) {
      const parsed = parseEnglishMonthTitle(raw);
      if (parsed) {
        monthTitle.textContent = `Tháng ${parsed.getMonth() + 1} năm ${parsed.getFullYear()}`;
      }
    }
  }

  const weekdayCells = root.querySelectorAll(
    ".grid.grid-cols-7.gap-y-2.text-center.mb-2 > div",
  );
  weekdayCells.forEach((cell: Element, index: number) => {
    const label = WEEKDAYS_VI[index];
    if (!label) return;
    if (cell.textContent !== label) cell.textContent = label;
  });
}

const KIT_COLORS = {
  primary: "#2563eb",
  secondary: "#6b7280",
  background: "#ffffff",
  foreground: "#1f2937",
  border: "#e5e7eb",
  muted: "#f9fafb",
  accent: "#dbeafe",
  accentForeground: "#1e40af",
  primaryForeground: "#ffffff",
};

const KIT_EVENT_COLORS = {
  primary: "#2563eb",
  success: "#22c55e",
  info: "#0ea5e9",
  warning: "#facc15",
  danger: "#dc2626",
  alternate: "#7e22ce",
};

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Sự kiện cả ngày",
    start: new Date(2023, 0, 1),
    end: new Date(2023, 0, 1, 23, 59),
    allDay: true,
    color: KIT_EVENT_COLORS.primary,
  },
  {
    id: "2",
    title: "Sự kiện dài ngày",
    start: new Date(2023, 0, 7),
    end: new Date(2023, 0, 10),
    allDay: true,
    color: KIT_EVENT_COLORS.info,
  },
  {
    id: "3",
    title: "Họp nội bộ",
    start: new Date(2023, 0, 12, 10, 30),
    end: new Date(2023, 0, 12, 12, 30),
    color: KIT_EVENT_COLORS.success,
  },
  {
    id: "4",
    title: "Ăn trưa",
    start: new Date(2023, 0, 12, 12, 0),
    end: new Date(2023, 0, 12, 13, 0),
    color: KIT_EVENT_COLORS.warning,
  },
  {
    id: "5",
    title: "Hội thảo",
    start: new Date(2023, 0, 11, 9, 0),
    end: new Date(2023, 0, 13, 17, 0),
    color: KIT_EVENT_COLORS.alternate,
  },
  {
    id: "6",
    title: "Sinh nhật",
    start: new Date(2023, 0, 13, 7, 0),
    end: new Date(2023, 0, 13, 9, 0),
    color: KIT_EVENT_COLORS.danger,
  },
];

const DEMO_DATE = new Date(2023, 0, 12);

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
  translations?: Partial<CalendarTranslations> & {
    calendars?: string;
    create?: string;
    localTime?: string;
  };
  locale?: Locale;
  timezone?: string;
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

function mergeColors(custom?: CalendarTheme) {
  return {
    ...KIT_COLORS,
    ...custom?.colors,
    accentForeground: KIT_COLORS.accentForeground,
    primaryForeground: KIT_COLORS.primaryForeground,
  };
}

function buildKitStyle(custom?: CalendarTheme): CSSProperties {
  const colors = mergeColors(custom);
  const radius = custom?.borderRadius ?? "0.375rem";
  const fontFamily = custom?.fontFamily ?? "inherit";

  return {
    fontFamily,
    ["--radius" as string]: radius,
    ["--primary" as string]: colors.primary,
    ["--color-primary" as string]: colors.primary,
    ["--primary-foreground" as string]: colors.primaryForeground,
    ["--color-primary-foreground" as string]: colors.primaryForeground,
    ["--secondary" as string]: colors.secondary,
    ["--color-secondary" as string]: colors.secondary,
    ["--background" as string]: colors.background,
    ["--color-background" as string]: colors.background,
    ["--foreground" as string]: colors.foreground,
    ["--color-foreground" as string]: colors.foreground,
    ["--border" as string]: colors.border,
    ["--color-border" as string]: colors.border,
    ["--muted" as string]: colors.muted,
    ["--color-muted" as string]: colors.muted,
    ["--muted-foreground" as string]: colors.secondary,
    ["--color-muted-foreground" as string]: colors.secondary,
    ["--accent" as string]: colors.accent,
    ["--color-accent" as string]: colors.accent,
    ["--accent-foreground" as string]: colors.accentForeground,
    ["--color-accent-foreground" as string]: colors.accentForeground,
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
  locale,
  timezone = "Asia/Ho_Chi_Minh",
  theme,
  calendars,
  resources,
  eventTypes,
  onCalendarToggle,
  isDarkMode,
  onThemeToggle,
}: CalendarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isEventsControlled = events !== undefined;
  const [innerEvents, setInnerEvents] = useState<CalendarEvent[]>(DEMO_EVENTS);
  const [innerView, setInnerView] = useState<ViewType>(defaultView);
  const [innerDate, setInnerDate] = useState<Date>(
    defaultDate ?? (isEventsControlled ? new Date() : DEMO_DATE),
  );

  const currentEvents = isEventsControlled ? events : innerEvents;
  const currentView = view ?? innerView;
  const currentDate = date ?? innerDate;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function applyVietnamese() {
      if (!rootRef.current) return;
      localizeMiniCalendar(rootRef.current);
    }

    applyVietnamese();
    const observer = new MutationObserver(applyVietnamese);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [currentDate, currentView]);

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
      {
        ...event,
        id: crypto.randomUUID(),
        color: event.color ?? KIT_EVENT_COLORS.primary,
      } as CalendarEvent,
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
      ref={rootRef}
      id="calendar"
      className={
        "kit-calendar flex h-full min-h-0 flex-col font-sans text-sm text-kit-body " +
        className
      }
      style={buildKitStyle(theme)}
    >
      <style>{`
        /* An chon Local Time / Timezone o cuoi sidebar */
        .kit-calendar .mt-auto.px-4.pt-5 {
          display: none !important;
        }
        /* Card su kien (ngay/tuan): thanh mau trang thai solid ben trai */
        .kit-calendar .glass.overflow-hidden {
          border-left-width: 4px !important;
          border-left-style: solid !important;
        }
        /* Fill chieu cao parent (max viewport) */
        .kit-calendar > div {
          height: 100%;
          min-height: 0;
        }
      `}</style>
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
        translations={{ ...VI_TRANSLATIONS, ...translations }}
        locale={locale ?? VI_LOCALE}
        timezone={timezone}
        calendars={calendars ?? []}
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
