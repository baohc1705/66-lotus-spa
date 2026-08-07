using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
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
            var weekStart = request.WeekStart ?? ToMonday(DateTimeHelper.UtcToday());
            var weekEnd = weekStart.AddDays(6);

            var staff = await staffSqlRepository.AsQueryable(true)
                .Where(s => s.UserId == request.UserId)
                .Select(s => new { s.Id })
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null)
                return Result<StaffScheduleWeeklyDto>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var rows = await appointmentSqlRepository.AsQueryable(true)
                .Where(a => a.StaffId == staff.Id
                    && a.AppointmentDate >= weekStart
                    && a.AppointmentDate <= weekEnd)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.TimeApptStart ?? a.TimeSlot!.StartTime)
                .Select(a => new
                {
                    a.AppointmentDate,
                    Booking = new StaffScheduleBookingDto
                    {
                        Id = a.Id.ToString(),
                        AppointmentCode = a.AppointmentCode,
                        CustomerName = a.CreatedByUser!.Customer!.FullName,
                        CustomerPhone = a.CreatedByUser!.Customer!.Phone,
                        ServiceName = string.Join(", ", a.Services!
                            .Where(s => s.Service != null)
                            .Select(s => s.Service!.Name)),
                        StartTime = a.TimeApptStart ?? a.TimeSlot!.StartTime,
                        EndTime = a.TimeApptEnd ?? a.TimeSlot!.EndTime,
                        Status = a.Status,
                        PaidAmount = a.PaidAmount,
                        TotalAmount = a.TotalAmount,
                        Note = a.Note,
                        PositionName = a.Position != null
                            ? a.Position.Room!.Name + " — " + a.Position.Name
                            : null,
                        TimeStartService = a.TimeStartService,
                        CompletedAt = a.CompletedAt,
                    }
                })
                .ToListAsync(cancellationToken);

            var days = new List<StaffScheduleDayDto>();
            for (int i = 0; i < 7; i++)
            {
                var currentDate = weekStart.AddDays(i);
                days.Add(new StaffScheduleDayDto
                {
                    Date = currentDate.ToString("yyyy-MM-dd"),
                    Bookings = rows
                        .Where(r => r.AppointmentDate == currentDate)
                        .Select(r => r.Booking)
                        .ToList(),
                });
            }

            return Result<StaffScheduleWeeklyDto>.Success(new StaffScheduleWeeklyDto
            {
                WeekStart = weekStart.ToString("yyyy-MM-dd"),
                WeekEnd = weekEnd.ToString("yyyy-MM-dd"),
                Days = days,
            });
        }

        private static DateOnly ToMonday(DateOnly date)
        {
            var dayOfWeek = (int)date.DayOfWeek;
            var daysFromMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
            return date.AddDays(-daysFromMonday);
        }
    }
}
