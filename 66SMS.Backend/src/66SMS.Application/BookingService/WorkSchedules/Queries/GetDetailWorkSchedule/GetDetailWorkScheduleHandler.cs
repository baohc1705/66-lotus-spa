using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.WorkSchedules.Queries.GetDetailWorkSchedule
{
    public class GetDetailWorkScheduleHandler : IRequestHandler<GetDetailWorkScheduleQuery, Result<WorkScheduleDTO>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;

        public GetDetailWorkScheduleHandler(IWorkScheduleSqlRepository workScheduleSqlRepository)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
        }

        public async Task<Result<WorkScheduleDTO>> Handle(GetDetailWorkScheduleQuery request, CancellationToken cancellationToken)
        {
            WorkScheduleDTO? workSchedule = await workScheduleSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new WorkScheduleDTO
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
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (workSchedule == null)
                return Result<WorkScheduleDTO>.NotFound();

            return Result<WorkScheduleDTO>.Success(workSchedule);
        }
    }
}
