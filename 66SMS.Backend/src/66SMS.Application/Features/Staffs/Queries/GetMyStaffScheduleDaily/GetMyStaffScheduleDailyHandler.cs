using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
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

        private StaffScheduleBookingDto MapBooking(Domain.Entities.Appointment a)
        {
            // Map integer status to string equivalent based on BookingStatus
            string statusStr = a.Status switch
            {
                0 => "pending",
                1 => "not-arrived",
                2 => "waiting",
                3 => "in-service",
                4 => "unpaid",
                5 => "completed",
                6 => "cancelled",
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
                StartTime = a.TimeSlot?.StartTime.ToString(@"hh\:mm") ?? "00:00",
                EndTime = a.TimeSlot?.EndTime.ToString(@"hh\:mm") ?? "00:00",
                Status = statusStr,
                TotalAmount = a.TotalAmount,
                Note = a.Note
            };
        }
    }
}
