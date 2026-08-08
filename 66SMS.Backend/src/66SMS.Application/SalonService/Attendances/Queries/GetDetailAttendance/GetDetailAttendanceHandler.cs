using _66SMS.Application.DTOs.Attendances;
using _66SMS.Application.SalonService.Helpers;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Attendances.Queries.GetDetailAttendance
{
    public class GetDetailAttendanceHandler : IRequestHandler<GetDetailAttendanceQuery, Result<AttendanceDTO>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;

        public GetDetailAttendanceHandler(IAttendanceSqlRepository attendanceRepository)
        {
            this.attendanceRepository = attendanceRepository;
        }

        public async Task<Result<AttendanceDTO>> Handle(GetDetailAttendanceQuery request, CancellationToken cancellationToken)
        {
            var attendance = await attendanceRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new AttendanceDTO
                {
                    Id = x.Id,
                    StaffId = x.StaffId,
                    StaffName = x.Staff != null ? x.Staff.FullName : null,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    WorkScheduleId = x.WorkScheduleId,
                    WorkDate = x.WorkDate,
                    CheckInAt = x.CheckInAt,
                    CheckOutAt = x.CheckOutAt,
                    WorkedHours = x.WorkedHours,
                    Status = x.Status,
                    Note = x.Note,
                    ShiftName = x.WorkSchedule != null
                        && x.WorkSchedule.ShiftPeriod != null
                        && x.WorkSchedule.ShiftPeriod.Shift != null
                            ? x.WorkSchedule.ShiftPeriod.Shift.Name
                            : null,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (attendance == null)
                return Result<AttendanceDTO>.NotFound(AttendanceConst.MSG_NOT_FOUND, ErrorCodes.ERR_ATTENDANCE_NOT_FOUND);

            attendance.WorkCredits = AttendanceWorkCreditCalculator.CalculateWorkCredit(
                attendance.Status ?? 0,
                attendance.WorkedHours ?? 0m,
                attendance.CheckInAt,
                attendance.CheckOutAt);

            return Result<AttendanceDTO>.Success(attendance);
        }
    }
}
