using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.CreateCertificateType
{
    public class CreateCertificateTypeHandler : IRequestHandler<CreateCertificateTypeCommand, Result<int>>
    {
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateCertificateTypeHandler(ICertificateTypeSqlRepository certificateTypeRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.certificateTypeRepository = certificateTypeRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CreateCertificateTypeCommand request, CancellationToken cancellationToken)
        {
            var codeExists = certificateTypeRepository.AsQueryable()
                .Any(x => x.Code == request.Code && x.Status != CertificateTypeConst.STATUS_DELETED);

            if (codeExists)
                return Result<int>.Conflict(CertificateTypeConst.MSG_CODE_EXISTED, ErrorCodes.ERR_CERTIFICATE_TYPE_CODE_EXISTED);

            var entity = new CertificateType
            {
                Code = request.Code!,
                Name = request.Name!,
                Description = request.Description,
                SortOrder = request.SortOrder,
                Status = request.Status ?? CertificateTypeConst.STATUS_ACTIVED,
            };

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                certificateTypeRepository.Add(entity);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Created(entity.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
