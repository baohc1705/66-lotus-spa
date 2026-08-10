using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.Shifts.Commands.UpdateShift
{
    public class UpdateShiftHandler : IRequestHandler<UpdateShiftCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateShiftHandler(
            IShiftSqlRepository shiftSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateShiftCommand request, CancellationToken cancellationToken)
        {
            Shift? shift = await shiftSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (shift == null)
            {
                return Result<object>.NotFound(ShiftConst.MSG_SHIFT_ID_NOT_FOUND);
            }

            mapper.Map(request, shift);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                shiftSqlRepository.Update(shift);
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
