using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetTechnicians
{
    public class GetTechniciansHandler : IRequestHandler<GetTechniciansQuery, Result<IReadOnlyList<BookingTechnicianDto>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetTechniciansHandler(IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<IReadOnlyList<BookingTechnicianDto>>> Handle(GetTechniciansQuery request, CancellationToken cancellationToken)
        {
            var rows = await appointmentSqlRepository.GetBookingTechniciansAsync(
                (DateOnly)request.Date!,
                (int)request.ServiceId!,
                request.SalonId,
                cancellationToken);

            if (rows.Count == 0)
                return Result<IReadOnlyList<BookingTechnicianDto>>.Success([]);

            var maxFreeSlots = rows.Max(r => r.SlotsLeft);
            var result = new List<BookingTechnicianDto>
            {
                new()
                {
                    Id = null,
                    Name = AppointmentConst.BOOKING_ANY_TECHNICIAN_NAME,
                    Role = AppointmentConst.BOOKING_ANY_TECHNICIAN_ROLE,
                    AccountRole = AppointmentConst.BOOKING_ACCOUNT_ROLE_STAFF,
                    SlotsLeft = maxFreeSlots,
                    Status = GetStatusText(maxFreeSlots),
                    IsAny = true,
                }
            };

            foreach (var row in rows)
            {
                result.Add(new BookingTechnicianDto
                {
                    Id = row.StaffId,
                    Name = row.StaffName,
                    Role = AppointmentConst.BOOKING_TECHNICIAN_ROLE,
                    AccountRole = AppointmentConst.BOOKING_ACCOUNT_ROLE_STAFF,
                    Avatar = row.Avatar,
                    SlotsLeft = row.SlotsLeft,
                    Status = GetStatusText(row.SlotsLeft),
                    IsAny = false,
                });
            }

            return Result<IReadOnlyList<BookingTechnicianDto>>.Success(result);
        }

        private static string GetStatusText(int freeSlots)
        {
            if (freeSlots <= 0) return AppointmentConst.BOOKING_STATUS_NO_SLOT;
            if (freeSlots == 1) return AppointmentConst.BOOKING_STATUS_ONE_SLOT;
            return string.Format(AppointmentConst.BOOKING_STATUS_SLOTS_LEFT, freeSlots);
        }
    }
}
