using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

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
                query = query.Where(x => x.CreatedByUserId == request.UserId);

            if (request.SalonId.HasValue)
                query = query.Where(x => x.SalonId == request.SalonId.Value);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            var result = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new AppointmentDto
                {
                    Id = x.Id,
                    AppointmentCode = x.AppointmentCode,
                    CustomerId = x.CreatedByUser!.Customer!.Id,
                    CustomerName = x.CreatedByUser!.Customer!.FullName,
                    CustomerPhone = x.CreatedByUser!.Customer!.Phone,
                    StaffId = x.StaffId,
                    SlotId = null,
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
                    PositionName = x.Position!.Name,
                    PositionRoomName = x.Position!.Room!.Name,
                    ServiceNames = x.Services!
                        .Where(s => s.Service != null)
                        .Select(s => s.Service!.Name)
                        .ToList(),
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<AppointmentDto>>.Success(result);
        }
    }
}
