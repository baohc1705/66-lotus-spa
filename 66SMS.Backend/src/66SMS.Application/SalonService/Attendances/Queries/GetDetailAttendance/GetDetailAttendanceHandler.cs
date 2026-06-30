using _66SMS.Application.DTOs.Attendances;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
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
                    WorkDate = x.WorkDate.ToString(),
                    CheckInAt = x.CheckInAt.ToString(),
                    CheckOutAt = x.CheckOutAt.ToString(),
                    WorkedHours = x.WorkedHours,
                    Status = x.Status,
                    Note = x.Note,
                    CreatedAt = x.CreatedAt.ToString(),
                    CreatedBy = x.CreatedBy,
                    UpdatedAt = x.UpdatedAt.ToString(),
                    UpdatedBy = x.UpdatedBy,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (attendance == null)
                return Result<AttendanceDTO>.NotFound(AttendanceConst.MSG_NOT_FOUND, ErrorCodes.ERR_ATTENDANCE_NOT_FOUND);

            return Result<AttendanceDTO>.Success(attendance);
        }
    }
}
