using System.Data;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.DeleteBookingRooms
{
    /// <summary>
    /// Handler để xóa phòng <see cref="DeleteBookingRoomCommand"/>.
    /// </summary>
    public class DeleteBookingRoomHandler : IRequestHandler<DeleteBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;    
        public DeleteBookingRoomHandler(
            IBookingRoomSqlRepository bookingRoomSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteBookingRoomCommand request, CancellationToken cancellationToken)
        {
            // Tìm phòng đặt khách hàng.
            BookingRoom? bookingRoom = await bookingRoomSqlRepository
                .AsQueryable(true)
                .Where(x => x.Id == request.Id)
                .Include(x => x.Positions)
                .FirstOrDefaultAsync(cancellationToken);

            // Nếu không tìm thấy phòng đặt khách hàng, trả về lỗi.
            if (bookingRoom == null)
            {
                return Result<object>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
            }

            // Nếu phòng đặt khách hàng có vị trí, trả về lỗi.
            if (bookingRoom.Positions != null || bookingRoom.Positions!.Count > 0)
            {
                return Result<object>.BadRequest(BookingRoomConst.MSG_BOOKING_ROOM_FK_CONSTRAINT, ErrorCodes.ERR_BOOKING_ROOM_INVALID);
            }

            // Update status deleted
            bookingRoom.Status = (int)StatusActiveEnum.DELETED;

            // Begin transaction.
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update entity.
                bookingRoomSqlRepository.Update(bookingRoom);

                // Save changes.
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit.
                transaction.Commit();

                // Remove cache detail and list.
                await cacheService.RemoveAsync(BookingRoomConst.CacheKeyDetail(bookingRoom.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(BookingRoomConst.CACHE_PREFIX, cancellationToken);

                // Return result.
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
