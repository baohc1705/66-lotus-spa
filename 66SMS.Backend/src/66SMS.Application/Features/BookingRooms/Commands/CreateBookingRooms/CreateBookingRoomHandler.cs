using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.BookingRooms.Commands.CreateBookingRooms
{
    public class CreateBookingRoomHandler : IRequestHandler<CreateBookingRoomCommand, Result<object>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateBookingRoomHandler(
            IBookingRoomSqlRepository bookingRoomSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateBookingRoomCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                BookingRoom bookingRoom = mapper.Map<BookingRoom>(request);
                bookingRoom.CreatedAt = DateTimeHelper.UtcNow();
                bookingRoom.CreatedBy = request.CreatedBy ?? 1;
                bookingRoom.Status = request.Status ?? _66SMS.Domain.Constants.BookingRoomConst.STATUS_ACTIVED;

                bookingRoomSqlRepository.Add(bookingRoom);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

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
