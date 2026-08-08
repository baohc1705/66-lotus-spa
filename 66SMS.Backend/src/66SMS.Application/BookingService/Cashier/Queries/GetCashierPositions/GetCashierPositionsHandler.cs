using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions
{
    public sealed class GetCashierPositionsHandler(
        IBookingPositionSqlRepository bookingPositionSqlRepository,
        IAppointmentSqlRepository appointmentSqlRepository)
        : IRequestHandler<GetCashierPositionsQuery, Result<IReadOnlyList<CashierPositionDto>>>
    {
        private static readonly int[] ActiveAppointmentStatuses =
        [
            AppointmentConst.STATUS_PENDING,
            AppointmentConst.STATUS_CONFIRMED,
            AppointmentConst.STATUS_WAITING,
            AppointmentConst.STATUS_IN_SERVICE,
        ];

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
                .ToListAsync(cancellationToken);

            // Vị trí đã gắn lịch hẹn còn hiệu lực trong ngày → coi như đã chiếm
            HashSet<int> bookedPositionIds = [];
            if (request.Date.HasValue)
            {
                var date = request.Date.Value;
                bookedPositionIds = (await appointmentSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(a => a.AppointmentDate == date
                        && a.PositionId != null
                        && ActiveAppointmentStatuses.Contains(a.Status))
                    .Select(a => a.PositionId!.Value)
                    .Distinct()
                    .ToListAsync(cancellationToken))
                    .ToHashSet();
            }

            var result = positions.Select(p =>
            {
                var occupiedByAppointment = bookedPositionIds.Contains(p.Id);
                var baseSelectable = BookingPositionHelper.IsAvailable(p.Status);
                var isSelectable = baseSelectable && !occupiedByAppointment;

                string statusLabel;
                int status;
                if (occupiedByAppointment)
                {
                    status = BookingPositionConst.STATUS_IN_SERVICE;
                    statusLabel = "Đã có lịch";
                }
                else
                {
                    status = p.Status;
                    statusLabel = BookingPositionConst.GetStatusLabel(p.Status);
                }

                return new CashierPositionDto
                {
                    Id = p.Id,
                    RoomId = p.RoomId,
                    Name = p.Name,
                    RoomName = p.Room!.Name,
                    Status = status,
                    StatusLabel = statusLabel,
                    IsSelectable = isSelectable,
                };
            }).ToList();

            return Result<IReadOnlyList<CashierPositionDto>>.Success(result);
        }
    }
}
