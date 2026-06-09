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
            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.WorkDate == request.Filter.ParseDateOnly("yyyy-MM-dd") ||
                x.Employee.FullName.Contains(request.Filter));
            }

            var result = await query.Select(x => new WorkScheduleDTO
            {
                ShiftPeriodId = x.ShiftPeriodId,
                EmployeeId = x.EmployeeId,
                WorkDate = x.WorkDate,
                EmployeeName = x.Employee != null ? x.Employee.FullName : null,
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
