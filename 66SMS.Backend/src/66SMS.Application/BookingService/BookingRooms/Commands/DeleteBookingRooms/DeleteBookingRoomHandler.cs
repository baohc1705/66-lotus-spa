using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.DeleteBookingRooms
{
    public class DeleteBookingRoomHandler : IRequestHandler<DeleteBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteBookingRoomHandler(
            IBookingRoomSqlRepository bookingRoomSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteBookingRoomCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                BookingRoom? bookingRoom = await bookingRoomSqlRepository.FindByIdAsync((int)request.Id!);
                if (bookingRoom == null)
                {
                    return Result<object>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
                }

                bookingRoom.Status = BookingRoomConst.STATUS_DELETED;
                bookingRoom.UpdatedAt = DateTimeHelper.UtcNow();
                bookingRoom.UpdatedBy = request.UpdatedBy;
                bookingRoomSqlRepository.Update(bookingRoom);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<object>.Failure(500, $"An error occurred while deleting booking room: {ex.Message}");
            }
        }
    }
}
