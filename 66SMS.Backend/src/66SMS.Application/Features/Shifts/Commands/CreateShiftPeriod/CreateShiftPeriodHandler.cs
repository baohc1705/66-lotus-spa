using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Shifts.Commands.CreateShiftPeriod
{
    public class CreateShiftPeriodHandler : IRequestHandler<CreateShiftPeriodCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly IShiftPeriodSqlRepository shiftPeriodSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateShiftPeriodHandler(
            IShiftSqlRepository shiftSqlRepository,
            IShiftPeriodSqlRepository shiftPeriodSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.shiftPeriodSqlRepository = shiftPeriodSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateShiftPeriodCommand request, CancellationToken cancellationToken)
        {
            Shift? shift = await shiftSqlRepository.FindByIdAsync((int)request.ShiftId, false, cancellationToken);
            if (shift == null)
            {
                return Result<object>.NotFound();
            }

            ShiftPeriod shiftPeriod = mapper.Map<ShiftPeriod>(request);
            shiftPeriod.CreatedAt = DateTime.UtcNow;
            shiftPeriod.CreatedBy = request.CreatedBy ?? 1;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                ShiftPeriod? activePeriod = await shiftPeriodSqlRepository.AsQueryable(false)
                    .Where(x => x.ShiftId == request.ShiftId && x.EffectiveTo == null)
                    .FirstOrDefaultAsync(cancellationToken);

                if (activePeriod != null)
                {
                    activePeriod.EffectiveTo = shiftPeriod.EffectiveFrom.AddDays(-1);
                    shiftPeriodSqlRepository.Update(activePeriod);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                shiftPeriodSqlRepository.Add(shiftPeriod);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(shiftPeriod.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
