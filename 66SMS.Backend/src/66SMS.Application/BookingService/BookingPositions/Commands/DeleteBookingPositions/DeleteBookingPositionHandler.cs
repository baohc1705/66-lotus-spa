using System.Data;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.DeleteBookingPositions
{
    public class DeleteBookingPositionHandler : IRequestHandler<DeleteBookingPositionCommand, Result<object>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;
        public DeleteBookingPositionHandler(
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteBookingPositionCommand request, CancellationToken cancellationToken)
        {
            BookingPosition? bookingPosition = await bookingPositionSqlRepository.FindByIdAsync((int)request.Id!);
            if (bookingPosition == null)
            {
                return Result<object>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
            }
            bookingPosition.Status = (int)StatusActiveEnum.DELETED;
            bookingPosition.UpdatedAt = DateTimeHelper.UtcNow();
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                bookingPositionSqlRepository.Update(bookingPosition);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                // Xóa cache list vị trí + chi tiết phòng (expanded chứa positions).
                await cacheService.RemoveAsync(BookingPositionConst.CacheKeyDetail(bookingPosition.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(BookingPositionConst.CACHE_PREFIX, cancellationToken);
                await cacheService.RemoveAsync(BookingRoomConst.CacheKeyDetail(bookingPosition.RoomId), cancellationToken);

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
