using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.Salons.Commands.UpdateSalon
{
    public class UpdateSalonHandler : IRequestHandler<UpdateSalonCommand, Result<object>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateSalonHandler(ISalonSqlRepository salonSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateSalonCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Salon? salon = await salonSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
                if (salon == null)
                    return Result<object>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

                mapper.Map(request, salon);
                salon.UpdatedAt = DateTimeHelper.UtcNow();
                salon.UpdatedBy = request.UpdatedBy;

                salonSqlRepository.Update(salon);
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
