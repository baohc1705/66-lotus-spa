using _66SMS.Application.DTOs;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
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
            var startTime = DateTimeHelper.ParseTimeOnly(request.StartTime);
            if (startTime == null)
            {
                return Result<IReadOnlyList<StaffAvailabilityDto>>.BadRequest(
                    AppointmentConst.MSG_STAFF_AVAILABILITY_SLOT_REQUIRED);
            }

            var serviceIds = request.ServiceIds;
            if (serviceIds == null || serviceIds.Count == 0)
            {
                serviceIds = new List<int>();
                if (request.ServiceId.HasValue && request.ServiceId.Value > 0)
                    serviceIds.Add(request.ServiceId.Value);
            }
            if (serviceIds.Count == 0)
            {
                return Result<IReadOnlyList<StaffAvailabilityDto>>.BadRequest(
                    AppointmentConst.MSG_STAFF_AVAILABILITY_SERVICE_REQUIRED);
            }

            var rows = await appointmentSqlRepository.GetStaffAvailabilityAsync(
                request.Date!.Value,
                serviceIds,
                request.SalonId,
                startTime.Value,
                cancellationToken);

            var data = new List<StaffAvailabilityDto>();
            for (var index = 0; index < rows.Count; index++)
            {
                var row = rows[index];
                data.Add(new StaffAvailabilityDto
                {
                    StaffId = row.StaffId,
                    StaffName = row.StaffName,
                    Avatar = row.Avatar,
                    Status = row.Status,
                    Reason = row.Reason,
                    ScheduleId = row.ScheduleId,
                    BusyCustomerName = row.BusyCustomerName,
                    BusyTimeRange = row.BusyTimeRange,
                });
            }

            return Result<IReadOnlyList<StaffAvailabilityDto>>.Success(data);
        }
    }
}
