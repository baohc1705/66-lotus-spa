using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetAllBookingPositions
{
    public class GetAllBookingPositionHandler : IRequestHandler<GetAllBookingPositionQuery, Result<PagedResult<BookingPositionDto>>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;    

        public GetAllBookingPositionHandler(IBookingPositionSqlRepository bookingPositionSqlRepository, IMapper mapper, ICacheService cacheService)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.mapper = mapper;
            this.cacheService = cacheService;
        }

        public async Task<Result<PagedResult<BookingPositionDto>>> Handle(GetAllBookingPositionQuery request, CancellationToken cancellationToken)
        {
            var filterHash = CacheKeyHash.FromObject(new
            {
                request.RoomId,
                request.Keyword,
                request.PageIndex,
                request.PageSize,
                request.OrderBy,
                request.IsDescending,
            });

            var cacheKey = BookingPositionConst.CacheKeyList(filterHash);

            var cached = await cacheService.GetAsync<PagedResult<BookingPositionDto>>(cacheKey, cancellationToken);

            if (cached is not null)
            {
                return Result<PagedResult<BookingPositionDto>>.Success(cached);
            }

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
                .ToPagedAsync(request, cancellationToken);

            await cacheService.SetAsync(cacheKey, result, BookingPositionConst.CACHE_TTL_LIST, cancellationToken);

            return Result<PagedResult<BookingPositionDto>>.Success(result);
        }
    }
}
