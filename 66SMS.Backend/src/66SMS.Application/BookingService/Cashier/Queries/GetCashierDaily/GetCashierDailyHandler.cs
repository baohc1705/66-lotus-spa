using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierDaily
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
            var fromDate = request.Date;
            var toDate = request.EndDate ?? request.Date;

            var columnRows = await appointmentRepository.GetCashierStaffColumnsAsync(
                request.SalonId,
                cancellationToken);

            var bookingRows = await appointmentRepository.GetCashierDailyBookingsAsync(
                fromDate,
                toDate,
                request.SalonId,
                cancellationToken);

            var dto = new CashierDailyDto
            {
                Columns = columnRows
                    .Select(c => new StaffColumnDto
                    {
                        Id = c.StaffId.ToString(),
                        Name = c.StaffName,
                        Avatar = c.Avatar,
                    })
                    .ToList(),
                Bookings = bookingRows
                    .Select(b => new CashierBookingDto
                    {
                        Id = b.Id.ToString(),
                        AppointmentCode = b.AppointmentCode,
                        CustomerName = b.CustomerName,
                        CustomerPhone = b.CustomerPhone,
                        CustomerAvatar = b.CustomerAvatar,
                        BookingDate = b.BookingDate,
                        ServiceName = b.ServiceName,
                        ServiceId = b.ServiceId,
                        StaffId = b.StaffId,
                        StaffName = b.StaffName,
                        SlotId = b.SlotId,
                        StartTime = b.StartTime,
                        EndTime = b.EndTime,
                        Status = b.Status,
                        TotalAmount = b.TotalAmount,
                        PaidAmount = b.PaidAmount,
                        DepositAmount = b.DepositAmount,
                        RemainingAmount = b.RemainingAmount,
                        DepositPaid = b.DepositPaid,
                        DepositDeadlineAt = b.DepositDeadlineAt,
                        Note = b.Note,
                        CustomerWalletBalance = b.CustomerWalletBalance,
                        InvoiceId = b.InvoiceId,
                        InvoiceCode = b.InvoiceCode,
                        DiscountAmount = b.DiscountAmount,
                        PositionId = b.PositionId,
                        PositionName = b.PositionName,
                        PositionStatus = b.PositionStatus,
                    })
                    .ToList(),
            };

            return Result<CashierDailyDto>.Success(dto);
        }
    }
}
