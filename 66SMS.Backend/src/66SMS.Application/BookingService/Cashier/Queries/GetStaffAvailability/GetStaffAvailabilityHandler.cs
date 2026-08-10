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

            var rows = await appointmentSqlRepository.GetStaffAvailabilityAsync(
                request.Date!.Value,
                request.ServiceId!.Value,
                request.SalonId,
                startTime.Value,
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
