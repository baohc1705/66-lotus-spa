using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetAllAppointment
{
    public class GetAllAppointmentHandler : IRequestHandler<GetAllAppointmentQuery, Result<PagedResult<AppointmentDto>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetAllAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<PagedResult<AppointmentDto>>> Handle(GetAllAppointmentQuery request, CancellationToken cancellationToken)
        {
            var query = appointmentSqlRepository.AsQueryable();
            if (request.UserId != null && request.UserId > 0)
            {
                query = query.Where(x => x.CreatedByUserId == request.UserId);
            }
            if (request.SalonId.HasValue)
            {
                query = query.Where(x => x.SalonId == request.SalonId.Value);
            }

            var result = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new AppointmentDto
                {
                    Id = x.Id,
                    AppointmentCode = x.AppointmentCode,
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
                    ServicesSubTotal = x.Services!
                        .Sum(s => s.PriceSnapshot * s.Quantity),
                    StaffFullName = x.Staff != null ? x.Staff.FullName : null,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    TimeSlotStartTime = x.TimeSlot != null ? x.TimeSlot.StartTime : null,
                    TimeSlotEndTime = x.TimeSlot != null ? x.TimeSlot.EndTime : null,
                    ServiceNames = x.Services!
                        .Where(s => s.Service != null && s.Service.Name != null)
                        .Select(s => s.Service!.Name!)
                        .ToList(),
                })
                .ToPagedAsync(request, cancellationToken);

          
            if (result.Items.Count > 0)
            {
                var appointmentIds = result.Items
                    .Where(i => i.Id.HasValue)
                    .Select(i => i.Id!.Value)
                    .ToList();

                var appointments = await appointmentSqlRepository.AsQueryable(true)
                    .Where(a => appointmentIds.Contains(a.Id))
                    .Include(a => a.CreatedByUser!)
                        .ThenInclude(u => u.Customer!)
                            .ThenInclude(c => c!.MembershipCard!)
                                .ThenInclude(mc => mc!.Tier)
                    .ToListAsync(cancellationToken);

                var customerMap = appointments.ToDictionary(
                    a => a.Id,
                    a => a.CreatedByUser?.Customer);

                foreach (var item in result.Items)
                {
                    if (!item.Id.HasValue) continue;

                    customerMap.TryGetValue(item.Id.Value, out var customer);
                    var (membership, promo, _) = AppointmentInvoiceDiscountHelper.Split(
                        item.ServicesSubTotal ?? 0m,
                        item.TotalAmount ?? 0m,
                        item.Note,
                        customer);

                    item.MembershipDiscountAmount = membership;
                    item.PromotionDiscountAmount = promo;
                }
            }

            return Result<PagedResult<AppointmentDto>>.Success(result);
        }
    }
}
