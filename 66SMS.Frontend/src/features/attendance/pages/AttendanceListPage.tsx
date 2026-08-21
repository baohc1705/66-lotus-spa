import { useState } from "react";

import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";

import { AttendanceCalendar } from "../components/AttendanceCalendar";
import { AttendanceForm } from "../components/AttendanceForm";
import type { AttendanceDto } from "../types/attendance.types";

export function AttendanceListPage() {
  const [selectedSchedule, setSelectedSchedule] =
    useState<WorkScheduleDTO | null>(null);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  function handleSelectSchedule(
    schedule: WorkScheduleDTO,
    attendance: AttendanceDto | null,
  ) {
    setSelectedSchedule(schedule);
    setSelectedAttendance(attendance);
    setIsFormOpen(true);
  }

  return (
    <>
      <AttendanceCalendar onSelectSchedule={handleSelectSchedule} />

      {selectedSchedule && isFormOpen ? (
        <AttendanceForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          schedule={selectedSchedule}
          attendance={selectedAttendance}
        />
      ) : null}
    </>
  );
}
