using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierVnPayUrl
{
    public sealed class GetCashierVnPayUrlHandler : IRequestHandler<GetCashierVnPayUrlQuery, Result<string>>
    {
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly IVnPayService vnPayService;

        public GetCashierVnPayUrlHandler(
            IAppointmentSqlRepository appointmentRepository,
            IInvoiceSqlRepository invoiceRepository,
            IVnPayService vnPayService)
        {
            this.appointmentRepository = appointmentRepository;
            this.invoiceRepository = invoiceRepository;
            this.vnPayService = vnPayService;
        }

        public async Task<Result<string>> Handle(GetCashierVnPayUrlQuery request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentRepository.AsQueryable(asNoTracking: true)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result<string>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_ALREADY_PAID, ErrorCodes.ERR_APPOINTMENT_ALREADY_PAID);

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
                return Result<string>.BadRequest("Chỉ thanh toán khi dịch vụ đã hoàn tất và lịch ở trạng thái chờ thanh toán.");

            if (!AppointmentPaymentCalculator.HasDepositPaid(appointment))
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NOT_DEPOSITED_YET, ErrorCodes.ERR_APPOINTMENT_NOT_DEPOSITED_YET);

            var invoice = await invoiceRepository.AsQueryable(asNoTracking: true)
                .Where(i => i.AppointmentId == appointment.Id && (i.Status == InvoiceConst.STATUS_UNPAID || i.Status == InvoiceConst.STATUS_DRAFT))
                .OrderByDescending(i => i.Id)
                .FirstOrDefaultAsync(cancellationToken);

            var amount = invoice != null
                ? Math.Max(0m, invoice.TotalAmount - invoice.PaidAmount)
                : AppointmentPaymentCalculator.GetRemainingAmount(appointment);

            if (amount <= 0)
                return Result<string>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NO_REMAINING_AMOUNT, ErrorCodes.ERR_APPOINTMENT_NO_REMAINING_AMOUNT);

            var url = vnPayService.CreatePaymentUrl(
                appointment.Id,
                amount,
                request.IpAddress,
                AppointmentPaymentConst.PHASE_FINAL_PAYMENT);

            return Result<string>.Success(url, "Success");
        }
    }
}
