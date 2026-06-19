using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.BookingPositions.Commands.UpdateBookingPositions
{
    public class UpdateBookingPositionHandler : IRequestHandler<UpdateBookingPositionCommand, Result<object>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateBookingPositionHandler(
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateBookingPositionCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                BookingPosition bookingPosition = await bookingPositionSqlRepository.FindByIdAsync((int)request.Id);
                if (bookingPosition == null)
                {
                    return Result<object>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
                }

                mapper.Map(request, bookingPosition);
                bookingPosition.UpdatedAt = DateTimeHelper.UtcNow();
                bookingPosition.UpdatedBy = request.UpdatedBy;

                bookingPositionSqlRepository.Update(bookingPosition);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(bookingPosition.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
