using _66SMS.Application.DTOs.BookingPositions;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetAllBookingPositions
{
    public class GetAllBookingPositionHandler : IRequestHandler<GetAllBookingPositionQuery, Result<PagedResult<BookingPositionDto>>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly IMapper mapper;

        public GetAllBookingPositionHandler(IBookingPositionSqlRepository bookingPositionSqlRepository, IMapper mapper)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<BookingPositionDto>>> Handle(GetAllBookingPositionQuery request, CancellationToken cancellationToken)
        {
            var query = bookingPositionSqlRepository.AsQueryable();

            if (request.RoomId.HasValue)
            {
                query = query.Where(x => x.RoomId == request.RoomId.Value);
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower));
            }

            PagedResult<BookingPositionDto> result = await query
                .ProjectTo<BookingPositionDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<BookingPositionDto>>.Success(result);
        }
    }
}
