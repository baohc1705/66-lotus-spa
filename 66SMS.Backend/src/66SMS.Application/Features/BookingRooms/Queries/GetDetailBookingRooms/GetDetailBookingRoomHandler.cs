using _66SMS.Application.DTOs.BookingRooms;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.BookingRooms.Queries.GetDetailBookingRooms
{
    public class GetDetailBookingRoomHandler : IRequestHandler<GetDetailBookingRoomQuery, Result<BookingRoomDto>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly IMapper mapper;

        public GetDetailBookingRoomHandler(IBookingRoomSqlRepository bookingRoomSqlRepository, IMapper mapper)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<BookingRoomDto>> Handle(GetDetailBookingRoomQuery request, CancellationToken cancellationToken)
        {
            BookingRoomDto? bookingRoomDto = await bookingRoomSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<BookingRoomDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (bookingRoomDto == null)
            {
                return Result<BookingRoomDto>.NotFound("Booking room not found.", ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
            }

            return Result<BookingRoomDto>.Success(bookingRoomDto);
        }
    }
}
