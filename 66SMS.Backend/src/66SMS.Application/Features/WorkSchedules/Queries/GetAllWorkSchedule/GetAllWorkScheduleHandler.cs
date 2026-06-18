using _66SMS.Application.DTOs.Shifts;
using _66SMS.Application.DTOs.WorkSchedules;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Queries.GetAllWorkSchedule
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
                query = query.Where(x => x.Staff.FullName.StartsWith(request.Filter));
            }

            var result = await query.Select(x => new WorkScheduleDTO
            {
                Id = x.Id,
                ShiftPeriodId = x.ShiftPeriodId,
                StaffId = x.StaffId,
                WorkDate = x.WorkDate,
                StaffName = x.Staff != null ? x.Staff.FullName : null,
                Shift = x.ShiftPeriod != null && x.ShiftPeriod.Shift != null ? new ShiftDTO
                {
                    Id = x.ShiftPeriod.Shift.Id,
                    Name = x.ShiftPeriod.Shift.Name,
                    Description = x.ShiftPeriod.Shift.Description
                } : null
            }).ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<WorkScheduleDTO>>.Success(result);
        }
    }
}
