using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms
{
    public class CreateBookingRoomHandler : IRequestHandler<CreateBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public CreateBookingRoomHandler(
            IBookingRoomSqlRepository bookingRoomSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(CreateBookingRoomCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                    request.ImageUrl = null;

                BookingRoom bookingRoom = mapper.Map<BookingRoom>(request);
                bookingRoom.Status = request.Status ?? BookingRoomConst.STATUS_ACTIVED;

                bookingRoomSqlRepository.Add(bookingRoom);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    bookingRoom.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        BookingRoomConst.GenerateImageFileName(bookingRoom.Id),
                        BookingRoomConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(bookingRoom.ImageUrl))
                    {
                        bookingRoomSqlRepository.Update(bookingRoom);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                transaction.Commit();
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
