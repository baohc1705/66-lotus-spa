using System.Data;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions
{
    public class UpdateBookingPositionHandler : IRequestHandler<UpdateBookingPositionCommand, Result<object>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;

        public UpdateBookingPositionHandler(
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            ICacheService cacheService)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(UpdateBookingPositionCommand request, CancellationToken cancellationToken)
        {
            BookingPosition? bookingPosition = await bookingPositionSqlRepository.FindByIdAsync((int)request.Id!);
            if (bookingPosition == null)
            {
                return Result<object>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
            }

            mapper.Map(request, bookingPosition);

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
