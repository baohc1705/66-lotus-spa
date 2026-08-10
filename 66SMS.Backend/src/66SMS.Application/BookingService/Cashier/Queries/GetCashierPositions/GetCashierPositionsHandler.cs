using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions
{
    public sealed class GetCashierPositionsHandler : IRequestHandler<GetCashierPositionsQuery, Result<IReadOnlyList<CashierPositionDto>>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetCashierPositionsHandler(IBookingPositionSqlRepository bookingPositionSqlRepository, IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<IReadOnlyList<CashierPositionDto>>> Handle(
            GetCashierPositionsQuery request,
            CancellationToken cancellationToken)
        {
            var query = bookingPositionSqlRepository.AsQueryable()
                .Where(p => p.Status != BookingPositionConst.STATUS_DELETED && p.Status != BookingPositionConst.STATUS_INACTIVED);

            if (request.SalonId.HasValue)
                query = query.Where(p => p.Room != null && p.Room.SalonId == request.SalonId.Value);

            var positions = await query
                .OrderBy(p => p.Room!.Name)
                .ThenBy(p => p.SortOrder)
                .ThenBy(p => p.Name)
                .Select(p => new
                {
                    p.Id,
                    p.RoomId,
                    p.Name,
                    RoomName = p.Room!.Name,
                    p.Status,
                })
                .ToListAsync(cancellationToken);

            HashSet<int> bookedPositionIds = [];
            if (request.Date.HasValue)
            {
                var date = request.Date.Value;
                bookedPositionIds = (await appointmentSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(a => a.AppointmentDate == date
                        && a.PositionId != null
                        && (a.Status == AppointmentConst.STATUS_PENDING
                            || a.Status == AppointmentConst.STATUS_CONFIRMED
                            || a.Status == AppointmentConst.STATUS_WAITING
                            || a.Status == AppointmentConst.STATUS_IN_SERVICE))
                    .Select(a => a.PositionId!.Value)
                    .Distinct()
                    .ToListAsync(cancellationToken))
                    .ToHashSet();
            }

            var result = positions.Select(p =>
            {
                var occupiedByAppointment = bookedPositionIds.Contains(p.Id);
                var isSelectable = (p.Status == BookingPositionConst.STATUS_AVAILABLE
                        || p.Status == BookingPositionConst.STATUS_ACTIVED)
                    && !occupiedByAppointment;

                return new CashierPositionDto
                {
                    Id = p.Id,
                    RoomId = p.RoomId,
                    Name = p.Name,
                    RoomName = p.RoomName,
                    Status = occupiedByAppointment ? BookingPositionConst.STATUS_IN_SERVICE : p.Status,
                    StatusLabel = occupiedByAppointment
                        ? "Đã có lịch"
                        : BookingPositionConst.GetStatusLabel(p.Status),
                    IsSelectable = isSelectable,
                };
            }).ToList();

            return Result<IReadOnlyList<CashierPositionDto>>.Success(result);
        }
    }
}
