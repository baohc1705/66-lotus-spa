using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.Shifts.Commands.UpdateShift
{
    public class UpdateShiftHandler : IRequestHandler<UpdateShiftCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly IShiftPeriodSqlRepository shiftPeriodSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public UpdateShiftHandler(IShiftSqlRepository shiftSqlRepository, IShiftPeriodSqlRepository shiftPeriodSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.shiftPeriodSqlRepository = shiftPeriodSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateShiftCommand request, CancellationToken cancellationToken)
        {
            Shift? shift = await shiftSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            mapper.Map(request, shift);
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                shiftSqlRepository.Update(shift!);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                if (request.ShiftPeriod != null)
                {
                    if (request.ShiftPeriod.Id == null || request.ShiftPeriod.Id == 0)
                    {
                        var activePeriods = shiftPeriodSqlRepository.AsQueryable(false)
                            .Where(sp => sp.ShiftId == shift!.Id && sp.EffectiveTo == null)
                            .ToList();

                        bool shouldCreateNew = true;

                        foreach (var activePeriod in activePeriods)
                        {
                            if (request.ShiftPeriod.EffectiveFrom.HasValue)
                            {
                                if (activePeriod.EffectiveFrom >= request.ShiftPeriod.EffectiveFrom.Value)
                                {
                                    // If the old period starts on or after the new period,
                                    // we just update it instead of creating a negative duration period
                                    mapper.Map(request.ShiftPeriod, activePeriod);
                                    shiftPeriodSqlRepository.Update(activePeriod);
                                    shouldCreateNew = false;
                                }
                                else
                                {
                                    activePeriod.EffectiveTo = request.ShiftPeriod.EffectiveFrom.Value.AddDays(-1);
                                    shiftPeriodSqlRepository.Update(activePeriod);
                                }
                            }
                        }

                        if (shouldCreateNew)
                        {
                            ShiftPeriod newShiftPeriod = new ShiftPeriod();
                            mapper.Map(request.ShiftPeriod, newShiftPeriod);
                            newShiftPeriod.ShiftId = shift!.Id;
                            shiftPeriodSqlRepository.Add(newShiftPeriod);
                        }

                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                    else
                    {
                        ShiftPeriod? shiftPeriod = await shiftPeriodSqlRepository.FindByIdAsync((int)request.ShiftPeriod.Id, false, cancellationToken);
                        mapper.Map(request.ShiftPeriod, shiftPeriod);
                        shiftPeriodSqlRepository.Update(shiftPeriod!);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

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
