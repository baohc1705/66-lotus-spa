using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleDaily
{
    public sealed class GetMyStaffScheduleDailyHandler : IRequestHandler<GetMyStaffScheduleDailyQuery, Result<StaffScheduleDailyDto>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetMyStaffScheduleDailyHandler(
            IStaffSqlRepository staffSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<StaffScheduleDailyDto>> Handle(GetMyStaffScheduleDailyQuery request, CancellationToken cancellationToken)
        {
            var staff = await staffSqlRepository.AsQueryable(true)
                .Where(s => s.UserId == request.UserId)
                .Select(s => new { s.Id, s.FullName })
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null)
                return Result<StaffScheduleDailyDto>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            // Projection — không Include / Select *
            var rows = await appointmentSqlRepository.AsQueryable(true)
                .Where(a => a.StaffId == staff.Id && a.AppointmentDate == request.Date)
                .OrderBy(a => a.TimeSlot!.StartTime)
                .Select(a => new
                {
                    a.Id,
                    CustomerName = a.CreatedByUser!.Customer != null
                        ? a.CreatedByUser.Customer.FullName
                        : null,
                    CustomerPhone = a.CreatedByUser!.Customer != null
                        ? a.CreatedByUser.Customer.Phone
                        : null,
                    ServiceNames = a.Services!
                        .Where(s => s.Service != null && s.Service.Name != null)
                        .Select(s => s.Service!.Name!)
                        .ToList(),
                    DurationMins = a.Services!
                        .Sum(s => s.Service != null ? s.Service.DurationMins : 0),
                    StartTime = a.TimeSlot != null ? (TimeOnly?)a.TimeSlot.StartTime : null,
                    a.Status,
                    a.PaidAmount,
                    a.TotalAmount,
                    a.Note,
                })
                .ToListAsync(cancellationToken);

            var bookings = rows.Select(r => StaffScheduleMapping.ToBookingDto(
                r.Id,
                r.CustomerName,
                r.CustomerPhone,
                r.ServiceNames,
                r.DurationMins,
                r.StartTime,
                r.Status,
                r.PaidAmount,
                r.TotalAmount,
                r.Note)).ToList();

            return Result<StaffScheduleDailyDto>.Success(new StaffScheduleDailyDto
            {
                Date = request.Date.ToString("yyyy-MM-dd"),
                StaffName = staff.FullName,
                Bookings = bookings,
            });
        }
    }
}
