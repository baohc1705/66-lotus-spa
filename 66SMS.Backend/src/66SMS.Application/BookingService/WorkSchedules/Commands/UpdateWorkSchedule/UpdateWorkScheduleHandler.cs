using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;
using _66SMS.Contract.Helpers;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleHandler : IRequestHandler<UpdateWorkScheduleCommand, Result<object>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateWorkScheduleHandler(
            IWorkScheduleSqlRepository workScheduleSqlRepository,
            IShiftSqlRepository shiftSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.shiftSqlRepository = shiftSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            WorkSchedule? workSchedule = await workScheduleSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (workSchedule == null) return Result<object>.NotFound(WorkScheduleConst.MSG_WORK_SCHEDULE_NOT_FOUND, ErrorCodes.ERR_WORK_SCHEDULE_NOT_FOUND);

            int? previousShiftId = workSchedule.ShiftId;
            mapper.Map(request, workSchedule);
            workSchedule.UpdatedAt = DateTimeHelper.UtcNow();

            if (request.ShiftId.HasValue && request.ShiftId != previousShiftId)
            {
                var shiftHours = await shiftSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(x => x.Id == request.ShiftId.Value)
                    .Select(x => new { x.ShiftStart, x.ShiftEnd })
                    .FirstOrDefaultAsync(cancellationToken);

                if (shiftHours == null || !shiftHours.ShiftStart.HasValue || !shiftHours.ShiftEnd.HasValue)
                {
                    return Result<object>.BadRequest(WorkScheduleConst.MSG_SHIFT_REQUIRED);
                }

                workSchedule.ShiftStart = shiftHours.ShiftStart;
                workSchedule.ShiftEnd = shiftHours.ShiftEnd;
            }

            bool isDuplicate = await workScheduleSqlRepository.AnyAsync(
                x => x.Id != request.Id
                     && x.StaffId == workSchedule.StaffId
                     && x.ShiftId == workSchedule.ShiftId
                     && x.WorkDate == workSchedule.WorkDate,
                cancellationToken);
            if (isDuplicate)
            {
                return Result<object>.Conflict(WorkScheduleConst.MSG_WORK_SCHEDULE_DUPLICATE, ErrorCodes.ERR_WORK_SCHEDULE_DUPLICATE);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                workScheduleSqlRepository.Update(workSchedule);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
