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
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (workSchedule == null)
                return Result<WorkScheduleDTO>.NotFound();

            return Result<WorkScheduleDTO>.Success(workSchedule);
        }
    }
}
