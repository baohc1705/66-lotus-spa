using _66SMS.Application.DTOs.Attendances;
using _66SMS.Application.SalonService.Helpers;
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
                .Include(x => x.Staff)
                .Include(x => x.Salon)
                .Include(x => x.WorkSchedule!)
                .ThenInclude(w => w.ShiftPeriod)
                .Where(x => x.Id == request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (attendance == null)
                return Result<AttendanceDTO>.NotFound(AttendanceConst.MSG_NOT_FOUND, ErrorCodes.ERR_ATTENDANCE_NOT_FOUND);

            return Result<AttendanceDTO>.Success(AttendanceMapper.ToDto(attendance));
        }
    }
}
