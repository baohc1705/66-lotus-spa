using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.WorkSchedules.Queries.GetAllWorkSchedule
{
    public class GetAllWorkScheduleHandler : IRequestHandler<GetAllWorkScheduleQuery, Result<PagedResult<WorkScheduleDTO>>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;

        public GetAllWorkScheduleHandler(IWorkScheduleSqlRepository workScheduleSqlRepository)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
        }

        public async Task<Result<PagedResult<WorkScheduleDTO>>> Handle(GetAllWorkScheduleQuery request, CancellationToken cancellationToken)
        {
            var query = workScheduleSqlRepository.AsQueryable();
            if (!string.IsNullOrEmpty(request.StartDate))
            {
                var startDate = request.StartDate.ParseDateOnly("yyyy-MM-dd");
                query = query.Where(x => x.WorkDate >= startDate);
            }

            if (!string.IsNullOrEmpty(request.EndDate))
            {
                var endDate = request.EndDate.ParseDateOnly("yyyy-MM-dd");
                query = query.Where(x => x.WorkDate <= endDate);
            }

            if (request.StaffId.HasValue)
            {
                query = query.Where(x => x.StaffId == request.StaffId.Value);
            }

            if (request.SalonId.HasValue)
            {
                query = query.Where(x => x.SalonId == request.SalonId.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.Staff!.FullName.StartsWith(request.Filter));
            }

            var result = await query.Select(x => new WorkScheduleDTO
            {
                Id = x.Id,
                ShiftId = x.ShiftId,
                ShiftStart = x.ShiftStart,
                ShiftEnd = x.ShiftEnd,
                StaffId = x.StaffId,
                WorkDate = x.WorkDate,
                StaffName = x.Staff != null ? x.Staff.FullName : null,
                Shift = x.Shift != null ? new ShiftDTO
                {
                    Id = x.Shift.Id,
                    SalonId = x.Shift.SalonId,
                    Name = x.Shift.Name,
                    Description = x.Shift.Description,
                    ShiftStart = x.Shift.ShiftStart,
                    ShiftEnd = x.Shift.ShiftEnd,
                } : null
            }).ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<WorkScheduleDTO>>.Success(result);
        }
    }
}
