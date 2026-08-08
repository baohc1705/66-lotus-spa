using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.UpdateConfigAppointment
{
    public class UpdateConfigAppointmentHandler : IRequestHandler<UpdateConfigAppointmentCommand, Result<int>>
    {
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateConfigAppointmentHandler(
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(UpdateConfigAppointmentCommand request, CancellationToken cancellationToken)
        {
            ConfigAppointment? entity = await configAppointmentSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (entity == null)
            {
                return Result<int>.NotFound(ConfigAppointmentConst.MSG_NOT_FOUND, ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);
            }

            if (request.SalonId.HasValue && request.SalonId != entity.SalonId)
            {
                var salonExists = await salonSqlRepository.AsQueryable(asNoTracking: true)
                    .AnyAsync(x => x.Id == request.SalonId, cancellationToken);
                if (!salonExists)
                {
                    return Result<int>.NotFound(SalonConst.MSG_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);
                }

                var existed = await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                    .AnyAsync(x => x.SalonId == request.SalonId && x.Id != request.Id, cancellationToken);
                if (existed)
                {
                    return Result<int>.Conflict(ConfigAppointmentConst.MSG_SALON_EXISTED, ErrorCodes.ERR_CONFIG_APPOINTMENT_SALON_EXISTED);
                }
            }

            mapper.Map(request, entity);
            configAppointmentSqlRepository.Update(entity);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(entity.Id);
        }
    }
}
