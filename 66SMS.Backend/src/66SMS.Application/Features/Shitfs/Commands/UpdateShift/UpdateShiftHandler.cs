using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Shitfs.Commands.UpdateShift
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
            Shift shift = await shiftSqlRepository.GetByIdAsync((int)request.Id, false, cancellationToken);
            mapper.Map(request, shift);
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                shiftSqlRepository.Update(shift);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                if (request.ShiftPeriod != null)
                {
                    ShiftPeriod shiftPeriod = await shiftPeriodSqlRepository.GetByIdAsync((int)request.ShiftPeriod.Id, false, cancellationToken);
                    mapper.Map(request.ShiftPeriod, shiftPeriod);
                    shiftPeriodSqlRepository.Update(shiftPeriod);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
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
