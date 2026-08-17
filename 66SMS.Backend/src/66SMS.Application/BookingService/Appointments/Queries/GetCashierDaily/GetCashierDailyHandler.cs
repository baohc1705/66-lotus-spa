using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetCashierDaily
{
    public class GetCashierDailyHandler : IRequestHandler<GetCashierDailyQuery, Result<CashierDailyDto>>
    {
        private readonly IAppointmentSqlRepository appointmentRepository;

        public GetCashierDailyHandler(IAppointmentSqlRepository appointmentRepository)
        {
            this.appointmentRepository = appointmentRepository;
        }

        public async Task<Result<CashierDailyDto>> Handle(
            GetCashierDailyQuery request,
            CancellationToken cancellationToken)
        {
            var fromDate = request.Date!.Value;
            var toDate = request.EndDate ?? request.Date!.Value;

            var columnRows = await appointmentRepository.GetCashierStaffColumnsAsync(
                request.SalonId,
                cancellationToken);

            var bookingRows = await appointmentRepository.GetCashierDailyBookingsAsync(
                fromDate,
                toDate,
                request.SalonId,
                cancellationToken);

            var columns = new List<StaffColumnDto>();
            for (var index = 0; index < columnRows.Count; index++)
            {
                var column = columnRows[index];
                columns.Add(new StaffColumnDto
                {
                    Id = column.StaffId.ToString(),
                    Name = column.StaffName,
                    Avatar = column.Avatar,
                });
            }

            var bookings = new List<CashierCalendarBookingDto>();
            for (var index = 0; index < bookingRows.Count; index++)
            {
                var booking = bookingRows[index];
                bookings.Add(new CashierCalendarBookingDto
                {
                    Id = booking.Id.ToString(),
                    CustomerName = booking.CustomerName,
                    BookingDate = booking.BookingDate,
                    ServiceName = booking.ServiceName,
                    StaffId = booking.StaffId,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    Status = booking.Status,
                });
            }

            var dto = new CashierDailyDto
            {
                Columns = columns,
                Bookings = bookings,
            };

            return Result<CashierDailyDto>.Success(dto);
        }
    }
}
