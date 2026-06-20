using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.BookingService.Shifts.Commands.CreateShift
{
    public class CreateShiftHandler : IRequestHandler<CreateShiftCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly IShiftPeriodSqlRepository shiftPeriodSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateShiftHandler(
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

        public async Task<Result<object>> Handle(CreateShiftCommand request, CancellationToken cancellationToken)
        {
            Shift shift = mapper.Map<Shift>(request);
            ShiftPeriod shiftPeriod = mapper.Map<ShiftPeriod>(request.ShiftPeriod);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                shiftSqlRepository.Add(shift);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                shiftPeriod.ShiftId = shift.Id;
                shiftPeriodSqlRepository.Add(shiftPeriod);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(shift.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
