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
            BookingRoom? bookingRoom = await bookingRoomSqlRepository
                .AsQueryable(true)
                .Where(x => x.Id == request.Id)
                .Include(x => x.Positions)
                .FirstOrDefaultAsync(cancellationToken);

            if (bookingRoom == null)
            {
                return Result<object>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
            }

            if (bookingRoom.Positions != null || bookingRoom.Positions!.Count > 0)
            {
                return Result<object>.BadRequest(BookingRoomConst.MSG_BOOKING_ROOM_FK_CONSTRAINT, ErrorCodes.ERR_BOOKING_ROOM_INVALID);
            }

            bookingRoom.Status = (int)StatusActiveEnum.DELETED;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                bookingRoomSqlRepository.Update(bookingRoom);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(BookingRoomConst.CacheKeyDetail(bookingRoom.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(BookingRoomConst.CACHE_PREFIX, cancellationToken);

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
