using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.DeleteCertificateType
{
    public class DeleteCertificateTypeHandler : IRequestHandler<DeleteCertificateTypeCommand, Result<object>>
    {
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteCertificateTypeHandler(ICertificateTypeSqlRepository certificateTypeRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.certificateTypeRepository = certificateTypeRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteCertificateTypeCommand request, CancellationToken cancellationToken)
        {
            var entity = await certificateTypeRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (entity == null || entity.Status == CertificateTypeConst.STATUS_DELETED)
                return Result<object>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                entity.Status = CertificateTypeConst.STATUS_DELETED;
                entity.UpdatedAt = DateTime.UtcNow;
                entity.UpdatedBy = request.UpdatedBy;
                certificateTypeRepository.Update(entity);
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
