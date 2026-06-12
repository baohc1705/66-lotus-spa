using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.BookingPositions.Commands.DeleteBookingPositions
{
    public class DeleteBookingPositionHandler : IRequestHandler<DeleteBookingPositionCommand, Result<object>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteBookingPositionHandler(
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteBookingPositionCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                BookingPosition bookingPosition = await bookingPositionSqlRepository.FindByIdAsync((int)request.Id);
                if (bookingPosition == null)
                {
                    return Result<object>.NotFound("Booking position not found.", ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
                }

                bookingPosition.Status = BookingPositionConst.STATUS_DELETED;
                bookingPosition.UpdatedAt = DateTimeHelper.UtcNow();
                bookingPosition.UpdatedBy = request.UpdatedBy;
                bookingPositionSqlRepository.Update(bookingPosition);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<object>.Failure(500, $"An error occurred while deleting booking position: {ex.Message}");
            }
        }
    }
}
