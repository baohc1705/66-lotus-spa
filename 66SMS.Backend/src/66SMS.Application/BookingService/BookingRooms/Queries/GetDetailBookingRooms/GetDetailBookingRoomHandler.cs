using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.BookingRooms.Queries.GetDetailBookingRooms
{
    public class GetDetailBookingRoomHandler : IRequestHandler<GetDetailBookingRoomQuery, Result<BookingRoomDto>>
    {
        private readonly IBookingRoomSqlRepository bookingRoomSqlRepository;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;
        public GetDetailBookingRoomHandler(IBookingRoomSqlRepository bookingRoomSqlRepository, IMapper mapper, ICacheService cacheService)
        {
            this.bookingRoomSqlRepository = bookingRoomSqlRepository;
            this.mapper = mapper;
            this.cacheService = cacheService;
        }

        public async Task<Result<BookingRoomDto>> Handle(GetDetailBookingRoomQuery request, CancellationToken cancellationToken)
        {
            var cacheKey = BookingRoomConst.CacheKeyDetail((int)request.Id!);
            var cached = await cacheService.GetAsync<BookingRoomDto>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<BookingRoomDto>.Success(cached);
            }

            var result = await bookingRoomSqlRepository
                .AsQueryable(true)
                .Where(room => room.Id == request.Id)
                .Select(room => new BookingRoomDto
                {
                    Id = room.Id,
                    SalonId = room.SalonId,
                    SalonName = room.Salon != null ? room.Salon.Name : null,
                    Name = room.Name,
                    ImageUrl = room.ImageUrl,
                    Note = room.Note,
                    Status = room.Status,
                    AvailableCount = room.Positions!
                        .Count(p => p.Status == BookingPositionConst.STATUS_AVAILABLE
                            || p.Status == BookingPositionConst.STATUS_ACTIVED),
                    InServiceCount = room.Positions!
                        .Count(p => p.Status == BookingPositionConst.STATUS_IN_SERVICE),
                    TotalPositionCount = room.Positions!
                        .Count(p => p.Status != BookingPositionConst.STATUS_DELETED),
                    Positions = room.Positions!
                        .Where(p => p.Status != BookingPositionConst.STATUS_DELETED)
                        .OrderBy(p => p.SortOrder)
                        .Select(p => new BookingPositionDto
                        {
                            Id = p.Id,
                            RoomId = p.RoomId,
                            Name = p.Name,
                            SortOrder = p.SortOrder,
                            Note = p.Note,
                            Status = p.Status,
                        })
                        .ToList(),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (result == null)
            {
                return Result<BookingRoomDto>.NotFound(BookingRoomConst.MSG_BOOKING_ROOM_NOT_FOUND, ErrorCodes.ERR_BOOKING_ROOM_NOT_FOUND);
            }

            await cacheService.SetAsync(cacheKey, result, BookingRoomConst.CACHE_TTL_DETAIL, cancellationToken);

            return Result<BookingRoomDto>.Success(result);
        }
    }
}
