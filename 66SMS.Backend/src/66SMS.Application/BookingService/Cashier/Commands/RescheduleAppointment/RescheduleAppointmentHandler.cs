using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.RescheduleAppointment
{
    public sealed class RescheduleAppointmentHandler
        : IRequestHandler<RescheduleAppointmentCommand, Result<object>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public RescheduleAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(
            RescheduleAppointmentCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.Services)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (appointment.Status != AppointmentConst.STATUS_PENDING
                && appointment.Status != AppointmentConst.STATUS_CONFIRMED
                && appointment.Status != AppointmentConst.STATUS_WAITING)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_RESCHEDULE_ONLY_BEFORE_SERVICE);
            }

            var slotStart = DateTimeHelper.ParseTimeOnly(request.StartTime);
            if (slotStart == null)
                return Result<object>.BadRequest(AppointmentConst.MSG_RESCHEDULE_SLOT_REQUIRED);

            if (appointment.AppointmentDate == request.AppointmentDate
                && appointment.TimeApptStart == slotStart)
            {
                return Result<object>.Success(AppointmentConst.MSG_RESCHEDULE_UNCHANGED);
            }

            var mainServiceId = appointment.Services?.Select(s => s.ServiceId).FirstOrDefault() ?? 0;
            if (mainServiceId <= 0)
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);

            int? preferredStaffId = appointment.StaffId > 0 ? appointment.StaffId : null;

            var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                request.AppointmentDate,
                mainServiceId,
                slotId: null,
                preferredStaffId,
                appointment.SalonId,
                appointment.LockId,
                appointment.Id,
                startTime: slotStart,
                cancellationToken: cancellationToken);

            if (resolved == null && preferredStaffId.HasValue)
            {
                resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                    request.AppointmentDate,
                    mainServiceId,
                    slotId: null,
                    null,
                    appointment.SalonId,
                    appointment.LockId,
                    appointment.Id,
                    startTime: slotStart,
                    cancellationToken: cancellationToken);
            }

            if (resolved == null)
                return Result<object>.Conflict(AppointmentConst.MSG_RESCHEDULE_SLOT_UNAVAILABLE, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);

            var durationMinutes = appointment.Services?
                .Where(s => s.Status == AppointmentServiceConst.STATUS_ACTIVE)
                .Sum(s => s.DurationSnapshot * s.Quantity) ?? 0;

            appointment.AppointmentDate = request.AppointmentDate;
            appointment.StaffId = resolved.StaffId;
            appointment.ScheduleId = resolved.ScheduleId;
            appointment.TimeApptStart = slotStart;
            appointment.TimeApptEnd = durationMinutes > 0
                ? slotStart.Value.AddMinutes(durationMinutes)
                : null;
            appointment.UpdatedAt = DateTimeHelper.UtcNow();
            appointment.UpdatedBy = request.UserId;

            appointmentSqlRepository.Update(appointment);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Success(AppointmentConst.MSG_RESCHEDULE_SUCCESS);
        }
    }
}
