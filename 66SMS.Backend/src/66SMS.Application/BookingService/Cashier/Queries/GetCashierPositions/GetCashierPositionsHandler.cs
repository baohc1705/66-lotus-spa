using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions
{
    public sealed class GetCashierPositionsHandler(
        IBookingPositionSqlRepository bookingPositionSqlRepository)
        : IRequestHandler<GetCashierPositionsQuery, Result<IReadOnlyList<CashierPositionDto>>>
    {
        public async Task<Result<IReadOnlyList<CashierPositionDto>>> Handle(
            GetCashierPositionsQuery request,
            CancellationToken cancellationToken)
        {
            var query = bookingPositionSqlRepository.AsQueryable()
                .Include(p => p.Room)
                .Where(p => p.Status != BookingPositionConst.STATUS_DELETED
                    && p.Status != BookingPositionConst.STATUS_INACTIVED);

            if (request.SalonId.HasValue)
            {
                query = query.Where(p => p.Room != null && p.Room.SalonId == request.SalonId.Value);
            }

            var positions = await query
                .OrderBy(p => p.Room!.Name)
                .ThenBy(p => p.SortOrder)
                .ThenBy(p => p.Name)
                .Select(p => new CashierPositionDto
                {
                    Id = p.Id,
                    RoomId = p.RoomId,
                    Name = p.Name,
                    RoomName = p.Room!.Name,
                    Status = p.Status,
                    StatusLabel = BookingPositionConst.GetStatusLabel(p.Status),
                    IsSelectable = p.Status == BookingPositionConst.STATUS_AVAILABLE
                        || p.Status == BookingPositionConst.STATUS_ACTIVED
                })
                .ToListAsync(cancellationToken);

            return Result<IReadOnlyList<CashierPositionDto>>.Success(positions);
        }
    }
}
