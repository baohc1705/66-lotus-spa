using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.UpdateCertificateType
{
    public class UpdateCertificateTypeHandler : IRequestHandler<UpdateCertificateTypeCommand, Result<object>>
    {
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public UpdateCertificateTypeHandler(ICertificateTypeSqlRepository certificateTypeRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.certificateTypeRepository = certificateTypeRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(UpdateCertificateTypeCommand request, CancellationToken cancellationToken)
        {
            var entity = await certificateTypeRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (entity == null)
                return Result<object>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);

            var codeExists = certificateTypeRepository.AsQueryable()
                .Any(x => x.Code == request.Code && x.Id != request.Id && x.Status != (int)StatusActiveEnum.DELETED);

            if (codeExists)
                return Result<object>.Conflict(CertificateTypeConst.MSG_CODE_EXISTED, ErrorCodes.ERR_CERTIFICATE_TYPE_CODE_EXISTED);

            if (request.Code != null) entity.Code = request.Code;
            if (request.Name != null) entity.Name = request.Name;
            entity.Description = request.Description;
            if (request.SortOrder.HasValue) entity.SortOrder = request.SortOrder;
            if (request.Status.HasValue) entity.Status = request.Status.Value;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
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
