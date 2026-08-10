using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetStaffAvailability
{
    public class GetStaffAvailabilityHandler : IRequestHandler<GetStaffAvailabilityQuery, Result<IReadOnlyList<StaffAvailabilityDto>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetStaffAvailabilityHandler(IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<IReadOnlyList<StaffAvailabilityDto>>> Handle(GetStaffAvailabilityQuery request, CancellationToken cancellationToken)
        {
            var rows = await appointmentSqlRepository.GetStaffAvailabilityAsync(
                request.Date!.Value,
                request.SlotId!.Value,
                request.ServiceId!.Value,
                request.SalonId,
                cancellationToken);
            var data = rows.Select(r => new StaffAvailabilityDto
            {
                StaffId = r.StaffId,
                StaffName = r.StaffName,
                Avatar = r.Avatar,
                Status = r.Status,
                Reason = r.Reason,
                ScheduleId = r.ScheduleId,
                BusyCustomerName = r.BusyCustomerName,
                BusyTimeRange = r.BusyTimeRange,
            }).ToList();

            return Result<IReadOnlyList<StaffAvailabilityDto>>.Success(data);
        }
    }
}
