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

namespace _66SMS.Application.CatalogService.Services.Commands.UpdateServices
{
    public class UpdateServiceHandler : IRequestHandler<UpdateServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IServiceProductSqlRepository serviceProductSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateServiceHandler(
            IServiceSqlRepository serviceSqlRepository, 
            IServiceProductSqlRepository serviceProductSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.serviceProductSqlRepository = serviceProductSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Service? entity = await serviceSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
                if (entity == null)
                {
                    return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
                }

                mapper.Map(request, entity);
                entity.UpdatedAt = DateTimeHelper.UtcNow();
                entity.UpdatedBy = request.UpdatedBy;

                serviceSqlRepository.Update(entity);
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
