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
            int? currentPositionId = null;
            var occupyDate = request.Date;
            TimeOnly? occupyStart = null;
            TimeOnly? occupyEnd = null;

            if (request.ExcludeAppointmentId.HasValue)
            {
                var current = await appointmentSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(a => a.Id == request.ExcludeAppointmentId.Value)
                    .Select(a => new { a.PositionId, a.AppointmentDate, a.TimeApptStart, a.TimeApptEnd })
                    .FirstOrDefaultAsync(cancellationToken);
                if (current != null)
                {
                    currentPositionId = current.PositionId;
                    occupyDate ??= current.AppointmentDate;
                    occupyStart = current.TimeApptStart;
                    occupyEnd = current.TimeApptEnd;
                }
            }

            if (occupyDate.HasValue)
            {
                var date = occupyDate.Value;
                var excludeId = request.ExcludeAppointmentId;
                var busyQuery = appointmentSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(a => a.AppointmentDate == date
                        && a.PositionId != null
                        && (excludeId == null || a.Id != excludeId.Value)
                        && (a.Status == AppointmentConst.STATUS_PENDING
                            || a.Status == AppointmentConst.STATUS_CONFIRMED
                            || a.Status == AppointmentConst.STATUS_WAITING
                            || a.Status == AppointmentConst.STATUS_IN_SERVICE));

                if (occupyStart.HasValue && occupyEnd.HasValue)
                {
                    var start = occupyStart.Value;
                    var end = occupyEnd.Value;
                    busyQuery = busyQuery.Where(a =>
                        a.TimeApptStart != null
                        && a.TimeApptEnd != null
                        && a.TimeApptStart < end
                        && a.TimeApptEnd > start);
                }

                bookedPositionIds = (await busyQuery
                    .Select(a => a.PositionId!.Value)
                    .Distinct()
                    .ToListAsync(cancellationToken))
                    .ToHashSet();
            }

            var result = positions.Select(p =>
            {
                var occupiedByAppointment = bookedPositionIds.Contains(p.Id);
                var isCurrentSeat = currentPositionId.HasValue && p.Id == currentPositionId.Value;
                var isSelectable = !occupiedByAppointment || isCurrentSeat;

                return new CashierPositionDto
                {
                    Id = p.Id,
                    RoomId = p.RoomId,
                    Name = p.Name,
                    RoomName = p.RoomName,
                    Status = occupiedByAppointment && !isCurrentSeat
                        ? BookingPositionConst.STATUS_IN_SERVICE
                        : p.Status,
                    StatusLabel = occupiedByAppointment && !isCurrentSeat
                        ? "Đã có lịch"
                        : "Trống",
                    IsSelectable = isSelectable,
                };
            }).ToList();

            return Result<IReadOnlyList<CashierPositionDto>>.Success(result);
        }
    }
}
