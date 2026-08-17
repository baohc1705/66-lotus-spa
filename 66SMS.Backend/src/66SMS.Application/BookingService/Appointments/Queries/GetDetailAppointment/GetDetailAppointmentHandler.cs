using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetDetailAppointment
{
    public class GetDetailAppointmentHandler : IRequestHandler<GetDetailAppointmentQuery, Result<AppointmentDto>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IInvoiceSqlRepository invoiceSqlRepository;

        public GetDetailAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IInvoiceSqlRepository invoiceSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.invoiceSqlRepository = invoiceSqlRepository;
        }

        public async Task<Result<AppointmentDto>> Handle(GetDetailAppointmentQuery request, CancellationToken cancellationToken)
        {
            var appointmentId = (int)request.Id!;
            var row = await appointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.Id == appointmentId)
                .Select(x => new
                {
                    Dto = new AppointmentDto
                    {
                        Id = x.Id,
                        AppointmentCode = x.AppointmentCode,
                        CustomerId = x.CreatedByUser!.Customer != null ? x.CreatedByUser.Customer.Id : null,
                        CustomerName = x.CreatedByUser!.Customer != null ? x.CreatedByUser.Customer.FullName : null,
                        CustomerPhone = x.CreatedByUser!.Customer != null ? x.CreatedByUser.Customer.Phone : null,
                        CustomerAvatar = x.CreatedByUser!.Customer != null ? x.CreatedByUser.Customer.AvatarUrl : null,
                        StaffId = x.StaffId,
                        PositionId = x.PositionId,
                        AppointmentDate = x.AppointmentDate,
                        Status = x.Status,
                        Note = x.Note,
                        TotalAmount = x.TotalAmount,
                        PaidAmount = x.PaidAmount,
                        DepositPercent = x.DepositPercent,
                        DepositDeadlineAt = x.DepositDeadlineAt,
                        CreatedAt = x.CreatedAt.ToString(),
                        ServicesSubTotal = x.Services!.Sum(s => s.PriceSnapshot * s.Quantity),
                        StaffFullName = x.Staff!.FullName,
                        SalonName = x.Salon!.Name,
                        TimeSlotStartTime = x.TimeApptStart,
                        TimeSlotEndTime = x.TimeApptEnd,
                        PositionName = x.Position != null ? x.Position.Name : null,
                        PositionRoomName = x.Position != null && x.Position.Room != null ? x.Position.Room.Name : null,
                        PositionStatus = x.Position != null ? x.Position.Status : null,
                        TimeStartService = x.TimeStartService,
                        CompletedAt = x.CompletedAt,
                        CustomerWalletBalance = x.CreatedByUser!.Customer != null && x.CreatedByUser.Customer.Wallet != null
                            ? x.CreatedByUser.Customer.Wallet.Balance
                            : null,
                        Services = x.Services!
                            .OrderBy(s => s.Id)
                            .Select(s => new AppointmentServiceItemDto
                            {
                                ServiceId = s.ServiceId,
                                Name = s.Service != null ? s.Service.Name : null,
                                DurationMins = s.DurationSnapshot * s.Quantity,
                                Price = s.PriceSnapshot * s.Quantity,
                            })
                            .ToList(),
                    },
                    DiscountPercent = x.CreatedByUser!.Customer != null
                        && x.CreatedByUser.Customer.MembershipCard != null
                        && x.CreatedByUser.Customer.MembershipCard.Tier != null
                        ? x.CreatedByUser.Customer.MembershipCard.Tier.DiscountPercent ?? 0
                        : 0,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (row == null)
                return Result<AppointmentDto>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            var invoice = await invoiceSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.AppointmentId == appointmentId && x.Status != InvoiceConst.STATUS_CANCELLED)
                .Select(x => new { x.Id, x.InvoiceCode })
                .FirstOrDefaultAsync(cancellationToken);

            if (invoice != null)
            {
                row.Dto.InvoiceId = invoice.Id;
                row.Dto.InvoiceCode = invoice.InvoiceCode;
            }

            var (membership, promo, _) = AppointmentInvoiceDiscountHelper.Split(
                row.Dto.ServicesSubTotal ?? 0m,
                row.Dto.TotalAmount ?? 0m,
                row.DiscountPercent);

            row.Dto.MembershipDiscountAmount = membership > 0 ? membership : null;
            row.Dto.PromotionDiscountAmount = promo > 0 ? promo : null;

            return Result<AppointmentDto>.Success(row.Dto);
        }
    }
}
