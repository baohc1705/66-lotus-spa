using System.Data;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms
{
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
            BookingRoom bookingRoom = mapper.Map<BookingRoom>(request);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                bookingRoomSqlRepository.Add(bookingRoom);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    bookingRoom.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, BookingRoomConst.GenerateImageFileName(bookingRoom.Id), BookingRoomConst.IMAGE_FOLDER, cancellationToken);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(BookingRoomConst.CacheKeyDetail(bookingRoom.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(BookingRoomConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Created(bookingRoom.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
