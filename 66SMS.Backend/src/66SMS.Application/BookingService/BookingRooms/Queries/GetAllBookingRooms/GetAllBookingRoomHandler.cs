using _66SMS.Application.DTOs;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Queries.GetAllBookingRooms
{
    public class GetAllBookingRoomHandler : IRequestHandler<GetAllBookingRoomQuery, Result<PagedResult<BookingRoomDto>>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;

        public GetAllBookingRoomHandler(IBookingRoomSqlRepository bookingRoomSqlRepository, IMapper mapper, ICacheService cacheService)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.mapper = mapper;
            this.cacheService = cacheService;
        }

        public async Task<Result<PagedResult<BookingRoomDto>>> Handle(GetAllBookingRoomQuery request, CancellationToken cancellationToken)
        {
            // Generate cache key.
            var filterHash = CacheKeyHash.FromObject(new
            {
                request.SalonId,
                request.Keyword,
                request.PageIndex,
                request.PageSize,
                request.OrderBy,
                request.IsDescending,
            });

            // Generate cache key.
            var cacheKey = BookingRoomConst.CacheKeyList(filterHash);

            // Get cached data.
            var cached = await cacheService.GetAsync<PagedResult<BookingRoomDto>>(cacheKey, cancellationToken);

            // If cached data is not null, return cached data.
            if (cached is not null)
                return Result<PagedResult<BookingRoomDto>>.Success(cached);

            // Get data from database.
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
                .Select(x => new BookingRoomDto
                {
                    Id = x.Id,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    Name = x.Name,
                    ImageUrl = x.ImageUrl,
                    Note = x.Note,
                    Status = x.Status,
                    AvailableCount = x.Positions!
                        .Count(p => p.Status == BookingPositionConst.STATUS_AVAILABLE
                            || p.Status == BookingPositionConst.STATUS_ACTIVED),
                    InServiceCount = x.Positions!
                        .Count(p => p.Status == BookingPositionConst.STATUS_IN_SERVICE),
                    TotalPositionCount = x.Positions!
                        .Count(p => p.Status != BookingPositionConst.STATUS_DELETED),
                })
                .ToPagedAsync(request, cancellationToken);

            // Set cached data.
            await cacheService.SetAsync(cacheKey, result, BookingRoomConst.CACHE_TTL_LIST, cancellationToken);

            return Result<PagedResult<BookingRoomDto>>.Success(result);
        }
    }
}
