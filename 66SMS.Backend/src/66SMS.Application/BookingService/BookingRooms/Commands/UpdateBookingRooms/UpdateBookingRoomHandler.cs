using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
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

        public UpdateBookingRoomHandler(
            IBookingRoomSqlRepository bookingRoomSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
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

                mapper.Map(request, bookingRoom);
                bookingRoom.UpdatedAt = DateTimeHelper.UtcNow();

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
