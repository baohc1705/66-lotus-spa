using System.Data;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.CreateBookingPositions
{
    public class CreateBookingPositionHandler : IRequestHandler<CreateBookingPositionCommand, Result<object>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;    

        public CreateBookingPositionHandler(
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

        public async Task<Result<object>> Handle(CreateBookingPositionCommand request, CancellationToken cancellationToken)
        {
            BookingPosition bookingPosition = mapper.Map<BookingPosition>(request);
            

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                bookingPositionSqlRepository.Add(bookingPosition);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                // Xóa cache list vị trí + chi tiết phòng (expanded chứa positions).
                await cacheService.RemoveAsync(BookingPositionConst.CacheKeyDetail(bookingPosition.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(BookingPositionConst.CACHE_PREFIX, cancellationToken);
                await cacheService.RemoveAsync(BookingRoomConst.CacheKeyDetail(bookingPosition.RoomId), cancellationToken);
                
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
