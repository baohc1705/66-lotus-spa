using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Staffs.Queries.GetMyStaffScheduleDaily
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
            var staff = await staffSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(s => s.UserId == request.UserId, cancellationToken);
            
            if (staff == null)
                return Result<StaffScheduleDailyDto>.NotFound("Lỗi: Không tìm thấy nhân viên.");

            var appointments = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.CreatedByUser).ThenInclude(u => u!.Customer)
                .Include(a => a.TimeSlot)
                .Include(a => a.Services!).ThenInclude(s => s.Service)
                .Where(a => a.StaffId == staff.Id && a.AppointmentDate == request.Date)
                .ToListAsync(cancellationToken);

            var bookings = appointments
                .OrderBy(a => a.TimeSlot?.StartTime)
                .Select(MapBooking)
                .ToList();

            return Result<StaffScheduleDailyDto>.Success(new StaffScheduleDailyDto
            {
                Date = request.Date.ToString("yyyy-MM-dd"),
                StaffName = staff.FullName,
                Bookings = bookings
            });
        }

        private StaffScheduleBookingDto MapBooking(Appointment a)
        {
            // Map integer status to string equivalent based on BookingStatus
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

            var serviceNames = a.Services?
                .Select(s => s.Service?.Name ?? "")
                .Where(n => n != "")
                .ToList() ?? new List<string>();
            var serviceName = string.Join(", ", serviceNames);
            if (string.IsNullOrEmpty(serviceName)) serviceName = "Dịch vụ";

            var durationMins = a.Services?.Sum(s => s.Service?.DurationMins ?? 0) ?? 0;
            if (durationMins == 0) durationMins = 15;
            var startTs = a.TimeSlot?.StartTime ?? new TimeOnly(0, 0);
            var endTs = startTs.AddMinutes(durationMins);

            return new StaffScheduleBookingDto
            {
                Id = a.Id.ToString(),
                CustomerName = a.CreatedByUser?.Customer?.FullName ?? "Khách hàng",
                CustomerPhone = a.CreatedByUser?.Customer?.Phone ?? "",
                ServiceName = serviceName,
                StartTime = startTs.ToString(@"HH\:mm"),
                EndTime = endTs.ToString(@"HH\:mm"),
                Status = statusStr,
                TotalAmount = a.TotalAmount,
                Note = a.Note
            };
        }
    }
}
