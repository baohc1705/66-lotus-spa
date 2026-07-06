using MediatR;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Enumerations;
using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Enums;
using System.Data;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.DeleteCertificateTypeMultiples
{
    public class DeleteCertificateTypeMultiplesHandler : IRequestHandler<DeleteCertificateTypeMultiplesCommand, Result<object>>
    {
        private readonly ICertificateTypeSqlRepository certificateTypeSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteCertificateTypeMultiplesHandler(ICertificateTypeSqlRepository certificateTypeSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.certificateTypeSqlRepository = certificateTypeSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteCertificateTypeMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingTypes = await certificateTypeSqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingTypes.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);
            }

            var now = DateTime.UtcNow;
            foreach (var type in existingTypes)
            {
                type.Status = (int)StatusActiveEnum.DELETED;
                type.UpdatedAt = now;
                type.UpdatedBy = request.UpdatedBy;
                certificateTypeSqlRepository.Update(type);
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
