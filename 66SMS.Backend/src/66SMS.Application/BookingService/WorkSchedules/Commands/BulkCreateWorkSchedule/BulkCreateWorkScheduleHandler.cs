using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.BulkCreateWorkSchedule
{
    public class BulkCreateWorkScheduleHandler : IRequestHandler<BulkCreateWorkScheduleCommand, Result<object>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public BulkCreateWorkScheduleHandler(
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

        public async Task<Result<object>> Handle(BulkCreateWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            if (request.Schedules == null || request.Schedules.Count == 0)
            {
                return Result<object>.Ok();
            }

            var workDates = request.Schedules.Select(x => x.WorkDate).Distinct().ToList();
            var staffIds = request.Schedules.Select(x => x.StaffId).Distinct().ToList();
            var shiftIds = request.Schedules.Select(x => x.ShiftId).Distinct().ToList();

            var shifts = await shiftSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => shiftIds.Contains(x.Id))
                .Select(x => new { x.Id, x.ShiftStart, x.ShiftEnd })
                .ToListAsync(cancellationToken);

            var existingSchedules = workScheduleSqlRepository.AsQueryable()
                .Where(x => x.Status != WorkScheduleConst.STATUS_DELETED
                         && staffIds.Contains(x.StaffId)
                         && shiftIds.Contains(x.ShiftId)
                         && workDates.Contains(x.WorkDate))
                .ToList();

            var validSchedules = new List<WorkSchedule>();
            for (int index = 0; index < request.Schedules.Count; index++)
            {
                var schedule = request.Schedules[index];
                bool isDuplicate = false;
                for (int existingIndex = 0; existingIndex < existingSchedules.Count; existingIndex++)
                {
                    var existing = existingSchedules[existingIndex];
                    if (existing.StaffId == schedule.StaffId
                        && existing.ShiftId == schedule.ShiftId
                        && existing.WorkDate == schedule.WorkDate)
                    {
                        isDuplicate = true;
                        break;
                    }
                }
                if (isDuplicate) continue;

                var shift = shifts.FirstOrDefault(x => x.Id == schedule.ShiftId);
                if (shift == null || !shift.ShiftStart.HasValue || !shift.ShiftEnd.HasValue)
                {
                    return Result<object>.BadRequest(WorkScheduleConst.MSG_SHIFT_REQUIRED);
                }

                var entity = mapper.Map<WorkSchedule>(schedule);
                entity.ShiftStart = shift.ShiftStart;
                entity.ShiftEnd = shift.ShiftEnd;
                entity.CreatedAt = DateTimeHelper.UtcNow();
                entity.Status = WorkScheduleConst.STATUS_ACTIVED;
                validSchedules.Add(entity);
            }

            if (validSchedules.Count == 0) return Result<object>.Success(0);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                workScheduleSqlRepository.AddRange(validSchedules);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Created(validSchedules.Count);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
