using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.Appointments.Commands.UpdateAppointment
{
    public class UpdateAppointmentHandler : IRequestHandler<UpdateAppointmentCommand, Result<object>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public UpdateAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(UpdateAppointmentCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var appointment = await appointmentSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
                if (appointment == null) return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
                if (request.Note != null) appointment.Note = request.Note;
                if (request.Status.HasValue) appointment.Status = request.Status.Value;
                appointmentSqlRepository.Update(appointment);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
