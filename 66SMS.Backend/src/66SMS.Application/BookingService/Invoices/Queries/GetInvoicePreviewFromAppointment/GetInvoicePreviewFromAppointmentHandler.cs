using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Invoices.Queries.GetInvoicePreviewFromAppointment
{
    public class GetInvoicePreviewFromAppointmentHandler : IRequestHandler<GetInvoicePreviewFromAppointmentQuery, Result<InvoicePreviewDTO>>
    {
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly IInvoiceSqlRepository invoiceRepository;

        public GetInvoicePreviewFromAppointmentHandler(
            IAppointmentSqlRepository appointmentRepository,
            IInvoiceSqlRepository invoiceRepository)
        {
            this.appointmentRepository = appointmentRepository;
            this.invoiceRepository = invoiceRepository;
        }

        public async Task<Result<InvoicePreviewDTO>> Handle(GetInvoicePreviewFromAppointmentQuery request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentRepository.AsQueryable(asNoTracking: true)
                .Include(a => a.Staff)
                .Include(a => a.Services!)
                    .ThenInclude(s => s.Service)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u.Customer)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
            {
                return Result<InvoicePreviewDTO>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            var existingInvoice = await invoiceRepository.AsQueryable()
                .FirstOrDefaultAsync(i => i.AppointmentId == appointment.Id && i.Status != InvoiceConst.STATUS_CANCELLED, cancellationToken);

            var customer = appointment.CreatedByUser?.Customer;
            var remainingAmount = appointment.TotalAmount - appointment.PaidAmount;
            if (remainingAmount < 0) remainingAmount = 0;

            var items = new List<InvoicePreviewItemDTO>();
            decimal subTotal = 0;

            if (appointment.Services != null)
            {
                foreach (var appService in appointment.Services)
                {
                    var quantity = appService.Quantity;
                    var unitPrice = appService.PriceSnapshot;
                    var lineTotal = unitPrice * quantity;
                    subTotal += lineTotal;

                    items.Add(new InvoicePreviewItemDTO
                    {
                        ServiceId = appService.ServiceId,
                        ServiceName = appService.Service?.Name ?? "Dịch vụ",
                        UnitPrice = unitPrice,
                        Quantity = quantity,
                        LineTotal = lineTotal,
                        StaffId = appointment.StaffId,
                        StaffName = appointment.Staff?.FullName
                    });
                }
            }

            var discountAmount = subTotal - appointment.TotalAmount;
            if (discountAmount < 0) discountAmount = 0;

            var dto = new InvoicePreviewDTO
            {
                AppointmentId = appointment.Id,
                AppointmentCode = appointment.AppointmentCode,
                CustomerId = customer?.Id,
                CustomerName = customer?.FullName ?? appointment.CreatedByUser?.Username,
                CustomerPhone = customer?.Phone,
                SalonId = appointment.SalonId,
                SubTotal = subTotal,
                TotalAmount = appointment.TotalAmount,
                DiscountAmount = discountAmount,
                AlreadyPaid = appointment.PaidAmount,
                RemainingAmount = remainingAmount,
                CanCreateInvoice = appointment.Status == AppointmentConst.STATUS_COMPLETED && existingInvoice == null,
                ExistingInvoiceCode = existingInvoice?.InvoiceCode,
                Items = items
            };

            return Result<InvoicePreviewDTO>.Success(dto);
        }
    }
}
