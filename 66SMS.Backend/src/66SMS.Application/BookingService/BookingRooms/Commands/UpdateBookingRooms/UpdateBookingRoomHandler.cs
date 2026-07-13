using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.UpdateBookingRooms
{
    public class UpdateBookingRoomHandler : IRequestHandler<UpdateBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateBookingRoomHandler(
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

        public async Task<Result<object>> Handle(UpdateBookingRoomCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                BookingRoom? bookingRoom = await bookingRoomSqlRepository.FindByIdAsync((int)request.Id!);
                if (bookingRoom == null)
                {
                    return Result<object>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
                }

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                    request.ImageUrl = null;

                mapper.Map(request, bookingRoom);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    var url = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        BookingRoomConst.GenerateImageFileName(bookingRoom.Id),
                        BookingRoomConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(url))
                        bookingRoom.ImageUrl = url;
                }

                bookingRoomSqlRepository.Update(bookingRoom);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
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
