using _66SMS.Application.DTOs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetDetailBookingPositions
{
    public class GetDetailBookingPositionHandler : IRequestHandler<GetDetailBookingPositionQuery, Result<BookingPositionDto>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;

        public GetDetailBookingPositionHandler(IBookingPositionSqlRepository bookingPositionSqlRepository)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
        }

        public async Task<Result<BookingPositionDto>> Handle(GetDetailBookingPositionQuery request, CancellationToken cancellationToken)
        {
            var bookingPositionDto = await bookingPositionSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new BookingPositionDto
                {
                    Id = x.Id,
                    RoomId = x.RoomId,
                    Name = x.Name,
                    SortOrder = x.SortOrder,
                    Note = x.Note,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    RoomName = x.Room!.Name,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (bookingPositionDto == null)
                return Result<BookingPositionDto>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);

            return Result<BookingPositionDto>.Success(bookingPositionDto);
        }
    }
}
