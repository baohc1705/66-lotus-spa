using System.Data;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms
{
    /// <summary>
    /// Handler để tạo phòng <see cref="CreateBookingRoomCommand"/>.
    /// </summary>
    public class CreateBookingRoomHandler : IRequestHandler<CreateBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;            

        public CreateBookingRoomHandler(
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

        public async Task<Result<object>> Handle(CreateBookingRoomCommand request, CancellationToken cancellationToken)
        {
            // Map request to booking room.
            BookingRoom bookingRoom = mapper.Map<BookingRoom>(request);
            bookingRoom.ImageUrl = string.Empty;

            // Begin transaction.
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Add entity to repository.
                bookingRoomSqlRepository.Add(bookingRoom);

                // Save changes to database.
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // If image url is not empty, upload image and update image url.
                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    bookingRoom.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, BookingRoomConst.GenerateImageFileName(bookingRoom.Id), BookingRoomConst.IMAGE_FOLDER, cancellationToken);
                }

                // Save changes to database.
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit.
                transaction.Commit();

                // Remove cache detail and list.
                await cacheService.RemoveAsync(BookingRoomConst.CacheKeyDetail(bookingRoom.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(BookingRoomConst.CACHE_PREFIX, cancellationToken);

                // Return result.
                return Result<object>.Created(bookingRoom.Id);
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
