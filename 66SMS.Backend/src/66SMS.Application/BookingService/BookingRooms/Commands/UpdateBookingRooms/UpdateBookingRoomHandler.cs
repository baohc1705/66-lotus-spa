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
    /// <summary>
    /// Handler update <see cref="UpdateBookingRoomCommand"/>.
    /// </summary>
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
            // Find booking room by id.
            BookingRoom? bookingRoom = await bookingRoomSqlRepository.FindByIdAsync((int)request.Id!);

            // If booking room not found, return not found error.
            if (bookingRoom == null)
            {
                return Result<object>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
            }

            // Map request to booking room.
            mapper.Map(request, bookingRoom);

            // Begin transaction.
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // If image url is not empty, upload image and update image url.
                if (!string.IsNullOrEmpty(request.ImageUrl))
                {
                    bookingRoom.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageUrl,
                        BookingRoomConst.GenerateImageFileName(bookingRoom.Id),
                        BookingRoomConst.IMAGE_FOLDER,
                        cancellationToken);
                }

                // Update entity.
                bookingRoomSqlRepository.Update(bookingRoom);
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
                // Rollback.
                transaction.Rollback();
                throw;
            }
        }
    }
}
