using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
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
            var date = request.Date ?? DateTimeHelper.UtcToday();

            var staff = await staffSqlRepository.AsQueryable(true)
                .Where(s => s.UserId == request.UserId)
                .Select(s => new { s.Id, s.FullName })
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null)
                return Result<StaffScheduleDailyDto>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var bookings = await appointmentSqlRepository.AsQueryable(true)
                .Where(a => a.StaffId == staff.Id && a.AppointmentDate == date)
                .OrderBy(a => a.TimeApptStart ?? a.TimeSlot!.StartTime)
                .Select(a => new StaffScheduleBookingDto
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
                })
                .ToListAsync(cancellationToken);

            return Result<StaffScheduleDailyDto>.Success(new StaffScheduleDailyDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                StaffName = staff.FullName,
                Bookings = bookings,
            });
        }
    }
}
