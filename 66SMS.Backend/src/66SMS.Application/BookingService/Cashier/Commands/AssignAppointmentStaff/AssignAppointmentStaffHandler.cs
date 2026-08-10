using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentStaff
{
    public sealed class AssignAppointmentStaffHandler : IRequestHandler<AssignAppointmentStaffCommand, Result<object>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public AssignAppointmentStaffHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(
            AssignAppointmentStaffCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.Services)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (appointment.Status != AppointmentConst.STATUS_WAITING)
                return Result<object>.BadRequest(AppointmentConst.MSG_ASSIGN_STAFF_ONLY_WAITING);

            if (appointment.StaffId == request.StaffId)
                return Result<object>.Success(AppointmentConst.MSG_ASSIGN_STAFF_UNCHANGED);

            var mainServiceId = appointment.Services?.Select(s => s.ServiceId).FirstOrDefault() ?? 0;
            if (mainServiceId <= 0)
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);

            var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                appointment.AppointmentDate,
                mainServiceId,
                appointment.SlotId,
                request.StaffId,
                appointment.SalonId,
                appointment.LockId,
                cancellationToken);

            if (resolved == null)
                return Result<object>.Conflict(AppointmentConst.MSG_ASSIGN_STAFF_UNAVAILABLE, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);

            appointment.StaffId = resolved.StaffId;
            appointment.ScheduleId = resolved.ScheduleId;
            appointment.UpdatedAt = DateTimeHelper.UtcNow();
            appointment.UpdatedBy = request.UserId;

            appointmentSqlRepository.Update(appointment);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Success(AppointmentConst.MSG_ASSIGN_STAFF_SUCCESS);
        }
    }
}
