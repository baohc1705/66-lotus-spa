using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.Features.Staffs.Queries.GetMyStaffScheduleWeekly
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
            var staff = await staffSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(s => s.UserId == request.UserId, cancellationToken);
            
            if (staff == null)
                return Result<StaffScheduleWeeklyDto>.NotFound("Lỗi: Không tìm thấy nhân viên.");

            var weekEnd = request.WeekStart.AddDays(6);

            var appointments = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.CreatedByUser).ThenInclude(u => u!.Customer)
                .Include(a => a.TimeSlot)
                .Include(a => a.Services!).ThenInclude(s => s.Service)
                .Where(a => a.StaffId == staff.Id && a.AppointmentDate >= request.WeekStart && a.AppointmentDate <= weekEnd)
                .ToListAsync(cancellationToken);

            var days = new List<StaffScheduleDayDto>();
            
            for (int i = 0; i < 7; i++)
            {
                var currentDate = request.WeekStart.AddDays(i);
                var dailyBookings = appointments
                    .Where(a => a.AppointmentDate == currentDate)
                    .OrderBy(a => a.TimeSlot?.StartTime)
                    .Select(MapBooking)
                    .ToList();
                    
                days.Add(new StaffScheduleDayDto
                {
                    Date = currentDate.ToString("yyyy-MM-dd"),
                    Bookings = dailyBookings
                });
            }

            return Result<StaffScheduleWeeklyDto>.Success(new StaffScheduleWeeklyDto
            {
                WeekStart = request.WeekStart.ToString("yyyy-MM-dd"),
                WeekEnd = weekEnd.ToString("yyyy-MM-dd"),
                Days = days
            });
        }

        private StaffScheduleBookingDto MapBooking(Domain.Entities.Appointment a)
        {
            string statusStr = a.Status switch
            {
                AppointmentConst.STATUS_PENDING => "pending",
                AppointmentConst.STATUS_CONFIRMED => "confirmed",
                AppointmentConst.STATUS_WAITING => "waiting",
                AppointmentConst.STATUS_IN_SERVICE => "in-progress",
                AppointmentConst.STATUS_COMPLETED => a.PaidAmount >= a.TotalAmount ? "paid" : "unpaid",
                AppointmentConst.STATUS_CANCELLED => "cancelled",
                AppointmentConst.STATUS_NO_SHOW => "not-arrived",
                _ => "pending"
            };

            var serviceNames = a.Services?.Select(s => s.Service?.Name ?? "").Where(n => n != "").ToList() ?? new List<string>();
            var serviceName = string.Join(", ", serviceNames);
            if (string.IsNullOrEmpty(serviceName)) serviceName = "Dịch vụ";

            return new StaffScheduleBookingDto
            {
                Id = a.Id.ToString(),
                CustomerName = a.CreatedByUser?.Customer?.FullName ?? "Khách hàng",
                CustomerPhone = a.CreatedByUser?.Customer?.Phone ?? "",
                ServiceName = serviceName,
                StartTime = a.TimeSlot?.StartTime.ToString(@"HH\:mm") ?? "00:00",
                EndTime = a.TimeSlot?.EndTime.ToString(@"HH\:mm") ?? "00:00",
                Status = statusStr,
                TotalAmount = a.TotalAmount,
                Note = a.Note
            };
        }
    }
}
