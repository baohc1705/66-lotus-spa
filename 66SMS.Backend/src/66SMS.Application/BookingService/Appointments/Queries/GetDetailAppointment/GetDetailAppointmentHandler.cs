using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs.Appointments;
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

        public GetDetailAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<AppointmentDto>> Handle(GetDetailAppointmentQuery request, CancellationToken cancellationToken)
        {
            var row = await appointmentSqlRepository.AsQueryable()
                .Where(x => x.Id == (int)request.Id!)
                .Select(x => new
                {
                    Dto = new AppointmentDto
                    {
                        Id = x.Id,
                        AppointmentCode = x.AppointmentCode,
                        CustomerId = x.CreatedByUser!.Customer!.Id,
                        StaffId = x.StaffId,
                        SlotId = x.SlotId,
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
                        TimeSlotStartTime = x.TimeApptStart ?? x.TimeSlot!.StartTime,
                        TimeSlotEndTime = x.TimeApptEnd ?? x.TimeSlot!.EndTime,
                        PositionName = x.Position!.Name,
                        PositionRoomName = x.Position!.Room!.Name,
                        ServiceNames = x.Services!
                            .Where(s => s.Service != null)
                            .Select(s => s.Service!.Name)
                            .ToList(),
                    },
                    DiscountPercent = x.CreatedByUser!.Customer!.MembershipCard!.Tier!.DiscountPercent ?? 0,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (row == null)
                return Result<AppointmentDto>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

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
