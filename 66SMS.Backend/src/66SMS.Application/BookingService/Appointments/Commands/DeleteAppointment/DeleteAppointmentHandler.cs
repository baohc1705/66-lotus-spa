using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Contract.Enumerations;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentHandler : IRequestHandler<DeleteAppointmentCommand, Result<object>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public DeleteAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<object>> Handle(DeleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (appointment == null) return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            appointment.Status = AppointmentConst.STATUS_CANCELLED;
            appointmentSqlRepository.Update(appointment);
            await appointmentSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
