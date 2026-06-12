using _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.WorkSchedules.Commands.BulkCreateWorkSchedule
{
    public class BulkCreateWorkScheduleHandler : IRequestHandler<BulkCreateWorkScheduleCommand, Result<object>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public BulkCreateWorkScheduleHandler(IWorkScheduleSqlRepository workScheduleSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(BulkCreateWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            if (request.Schedules == null || request.Schedules.Count == 0)
            {
                return Result<object>.Success(null);
            }

            var workDates = request.Schedules.Select(x => x.WorkDate).Distinct().ToList();
            var staffIds = request.Schedules.Select(x => x.StaffId).Distinct().ToList();
            var shiftPeriodIds = request.Schedules.Select(x => x.ShiftPeriodId).Distinct().ToList();

            var existingSchedules = workScheduleSqlRepository.AsQueryable()
                .Where(x => staffIds.Contains(x.StaffId) 
                         && shiftPeriodIds.Contains(x.ShiftPeriodId) 
                         && workDates.Contains(x.WorkDate))
                .ToList();

            var validSchedules = new List<WorkSchedule>();
            foreach (var schedule in request.Schedules)
            {
                bool isDuplicate = existingSchedules.Any(x => x.StaffId == schedule.StaffId && x.ShiftPeriodId == schedule.ShiftPeriodId && x.WorkDate == schedule.WorkDate);
                if (!isDuplicate)
                {
                    var entity = mapper.Map<WorkSchedule>(schedule);
                    entity.CreatedAt = DateTime.UtcNow;
                    entity.CreatedBy = request.CreatedBy ?? 1;
                    entity.Status = _66SMS.Domain.Constants.WorkScheduleConst.STATUS_ACTIVED;
                    validSchedules.Add(entity);
                }
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
