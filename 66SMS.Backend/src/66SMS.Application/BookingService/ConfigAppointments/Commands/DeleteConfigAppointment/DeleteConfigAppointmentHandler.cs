using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.DeleteConfigAppointment
{
    public class DeleteConfigAppointmentHandler : IRequestHandler<DeleteConfigAppointmentCommand, Result<int>>
    {
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteConfigAppointmentHandler(
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(DeleteConfigAppointmentCommand request, CancellationToken cancellationToken)
        {
            ConfigAppointment? entity = await configAppointmentSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (entity == null)
            {
                return Result<int>.NotFound(ConfigAppointmentConst.MSG_NOT_FOUND, ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);
            }

            configAppointmentSqlRepository.Remove(entity);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(entity.Id);
        }
    }
}
