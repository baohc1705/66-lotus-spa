using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Services.Commands.DeleteServices
{
    public class DeleteServiceHandler : IRequestHandler<DeleteServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteServiceHandler(IServiceSqlRepository serviceSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Service? entity = await serviceSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
                if (entity == null)
                {
                    return Result<object>.NotFound("Service not found", ErrorCodes.ERR_SERVICE_NOT_FOUND);
                }

                entity.Status = ServiceConst.STATUS_DELETED;
                entity.UpdatedAt = DateTimeHelper.UtcNow();

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
