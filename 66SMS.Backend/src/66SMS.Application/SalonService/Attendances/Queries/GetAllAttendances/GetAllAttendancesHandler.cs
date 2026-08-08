using _66SMS.Application.DTOs;
using _66SMS.Application.SalonService.Helpers;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
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
                query = query.Where(x => x.WorkDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(x => x.WorkDate <= request.ToDate.Value);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.WorkDate).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.WorkDate).ThenBy(x => x.Id);

            var pagedDto = await query
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
                .ToPagedAsync(request, cancellationToken);

            foreach (var item in pagedDto.Items)
            {
                item.WorkCredits = AttendanceWorkCreditCalculator.CalculateWorkCredit(
                    item.Status ?? 0,
                    item.WorkedHours ?? 0m,
                    item.CheckInAt,
                    item.CheckOutAt);
            }

            return Result<PagedResult<AttendanceDTO>>.Success(pagedDto);
        }
    }
}
