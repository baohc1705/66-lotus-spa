using _66SMS.Application.DTOs.BookingRooms;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.Features.BookingRooms.Queries.GetAllBookingRooms
{
    public class GetAllBookingRoomHandler : IRequestHandler<GetAllBookingRoomQuery, Result<PagedResult<BookingRoomDto>>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly IMapper mapper;

        public GetAllBookingRoomHandler(IBookingRoomSqlRepository bookingRoomSqlRepository, IMapper mapper)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<BookingRoomDto>>> Handle(GetAllBookingRoomQuery request, CancellationToken cancellationToken)
        {
            var query = bookingRoomSqlRepository.AsQueryable();

            if (request.SalonId.HasValue)
            {
                query = query.Where(x => x.SalonId == request.SalonId.Value);
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower));
            }

            PagedResult<BookingRoomDto> result = await query
                .ProjectTo<BookingRoomDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<BookingRoomDto>>.Success(result);
        }
    }
}
