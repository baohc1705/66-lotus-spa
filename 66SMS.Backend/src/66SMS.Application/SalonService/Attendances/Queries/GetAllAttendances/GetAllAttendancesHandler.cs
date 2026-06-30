using _66SMS.Application.DTOs.Attendances;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Attendances.Queries.GetAllAttendances
{
    public class GetAllAttendancesHandler : IRequestHandler<GetAllAttendancesQuery, Result<PagedResult<AttendanceDTO>>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;

        public GetAllAttendancesHandler(IAttendanceSqlRepository attendanceRepository)
        {
            this.attendanceRepository = attendanceRepository;
        }

        public async Task<Result<PagedResult<AttendanceDTO>>> Handle(GetAllAttendancesQuery request, CancellationToken cancellationToken)
        {
            var query = attendanceRepository.AsQueryable();

            if (request.StaffId.HasValue)
                query = query.Where(x => x.StaffId == request.StaffId);

            if (request.SalonId.HasValue)
                query = query.Where(x => x.SalonId == request.SalonId);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status);

            if (request.FromDate.HasValue)
            {
                var from = DateOnly.FromDateTime(request.FromDate.Value);
                query = query.Where(x => x.WorkDate >= from);
            }

            if (request.ToDate.HasValue)
            {
                var to = DateOnly.FromDateTime(request.ToDate.Value);
                query = query.Where(x => x.WorkDate <= to);
            }

            query = request.IsDescending
                ? query.OrderByDescending(x => x.WorkDate).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.WorkDate).ThenBy(x => x.Id);

            var result = await query
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
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<AttendanceDTO>>.Success(result);
        }
    }
}
