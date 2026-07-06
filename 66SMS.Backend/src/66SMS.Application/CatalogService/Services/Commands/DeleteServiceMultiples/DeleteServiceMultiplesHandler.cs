using MediatR;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Enumerations;
using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Enums;
using System.Data;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServiceMultiples
{
    public class DeleteServiceMultiplesHandler : IRequestHandler<DeleteServiceMultiplesCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteServiceMultiplesHandler(IServiceSqlRepository serviceSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteServiceMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingServices = await serviceSqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingServices.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            var now = DateTime.UtcNow;
            foreach (var service in existingServices)
            {
                service.Status = (int)StatusActiveEnum.DELETED;
                service.UpdatedAt = now;
                service.UpdatedBy = request.UpdatedBy ?? 0;
                serviceSqlRepository.Update(service);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
