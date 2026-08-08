using System.Data;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.UpdateBookingRooms
{
    public class UpdateBookingRoomHandler : IRequestHandler<UpdateBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;    

        public UpdateBookingRoomHandler(
            IBookingRoomSqlRepository bookingRoomSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(UpdateBookingRoomCommand request, CancellationToken cancellationToken)
        {
            BookingRoom? bookingRoom = await bookingRoomSqlRepository.FindByIdAsync((int)request.Id!);

            if (bookingRoom == null)
            {
                return Result<object>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
            }

            mapper.Map(request, bookingRoom);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (!string.IsNullOrEmpty(request.ImageUrl))
                {
                    bookingRoom.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageUrl,
                        BookingRoomConst.GenerateImageFileName(bookingRoom.Id),
                        BookingRoomConst.IMAGE_FOLDER,
                        cancellationToken);
                }

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
