using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleWeekly
{
    public sealed class GetMyStaffScheduleWeeklyHandler : IRequestHandler<GetMyStaffScheduleWeeklyQuery, Result<StaffScheduleWeeklyDto>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetMyStaffScheduleWeeklyHandler(
            IStaffSqlRepository staffSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<StaffScheduleWeeklyDto>> Handle(GetMyStaffScheduleWeeklyQuery request, CancellationToken cancellationToken)
        {
            var staff = await staffSqlRepository.AsQueryable(true)
                .Where(s => s.UserId == request.UserId)
                .Select(s => new { s.Id })
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null)
                return Result<StaffScheduleWeeklyDto>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var weekEnd = request.WeekStart.AddDays(6);

            var rows = await appointmentSqlRepository.AsQueryable(true)
                .Where(a => a.StaffId == staff.Id
                    && a.AppointmentDate >= request.WeekStart
                    && a.AppointmentDate <= weekEnd)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.TimeSlot!.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.AppointmentCode,
                    a.AppointmentDate,
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
                    PositionName = a.Position != null
                        ? (a.Position.Room != null
                            ? a.Position.Room.Name + " — " + a.Position.Name
                            : a.Position.Name)
                        : null,
                    a.TimeStartService,
                    a.CompletedAt,
                })
                .ToListAsync(cancellationToken);

            var days = new List<StaffScheduleDayDto>();
            for (int i = 0; i < 7; i++)
            {
                var currentDate = request.WeekStart.AddDays(i);
                var dailyBookings = rows
                    .Where(a => a.AppointmentDate == currentDate)
                    .Select(r => StaffScheduleMapping.ToBookingDto(
                        r.Id,
                        r.AppointmentCode,
                        r.CustomerName,
                        r.CustomerPhone,
                        r.ServiceNames,
                        r.DurationMins,
                        r.StartTime,
                        r.Status,
                        r.PaidAmount,
                        r.TotalAmount,
                        r.Note,
                        r.PositionName,
                        r.TimeStartService,
                        r.CompletedAt))
                    .ToList();

                days.Add(new StaffScheduleDayDto
                {
                    Date = currentDate.ToString("yyyy-MM-dd"),
                    Bookings = dailyBookings,
                });
            }

            return Result<StaffScheduleWeeklyDto>.Success(new StaffScheduleWeeklyDto
            {
                WeekStart = request.WeekStart.ToString("yyyy-MM-dd"),
                WeekEnd = weekEnd.ToString("yyyy-MM-dd"),
                Days = days,
            });
        }
    }
}
