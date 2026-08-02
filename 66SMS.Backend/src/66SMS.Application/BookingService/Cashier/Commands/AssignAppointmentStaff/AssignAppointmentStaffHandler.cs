using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentStaff
{
    public sealed class AssignAppointmentStaffHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IBookingAvailabilityService bookingAvailabilityService,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<AssignAppointmentStaffCommand, Result<object>>
    {
        public async Task<Result<object>> Handle(
            AssignAppointmentStaffCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.Services)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
            {
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            if (appointment.Status != AppointmentConst.STATUS_WAITING)
            {
                return Result<object>.BadRequest("Chỉ đổi nhân viên khi lịch hẹn đang chờ phục vụ.");
            }

            if (appointment.StaffId == request.StaffId)
            {
                return Result<object>.Success("Nhân viên không thay đổi.");
            }

            var mainServiceId = appointment.Services?.FirstOrDefault()?.ServiceId ?? 0;

            if (mainServiceId <= 0)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE,ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);
            }

            var resolved = await bookingAvailabilityService.ResolveStaffAsync(
                appointment.AppointmentDate,
                mainServiceId,
                request.StaffId,
                appointment.SlotId,
                salonId: appointment.SalonId,
                excludeLockId: appointment.LockId,
                cancellationToken);

            if (resolved == null)
            {
                return Result<object>.Conflict("Nhân viên không khả dụng cho khung giờ này (trùng lịch, không có ca, hoặc không làm dịch vụ).",ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
            }

            appointment.StaffId = resolved.Value.StaffId;
            appointment.ScheduleId = resolved.Value.ScheduleId;
            appointment.UpdatedAt = DateTimeHelper.UtcNow();
            appointment.UpdatedBy = request.UserId;

            appointmentSqlRepository.Update(appointment);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Success("Đã cập nhật nhân viên thành công.");
        }
    }
}
