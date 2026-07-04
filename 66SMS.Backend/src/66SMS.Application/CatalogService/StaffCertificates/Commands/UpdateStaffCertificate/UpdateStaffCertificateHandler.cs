using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.UpdateStaffCertificate
{
    public class UpdateStaffCertificateHandler : IRequestHandler<UpdateStaffCertificateCommand, Result<object>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateRepository;
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public UpdateStaffCertificateHandler(
            IStaffCertificateSqlRepository staffCertificateRepository,
            ICertificateTypeSqlRepository certificateTypeRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.staffCertificateRepository = staffCertificateRepository;
            this.certificateTypeRepository = certificateTypeRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(UpdateStaffCertificateCommand request, CancellationToken cancellationToken)
        {
            var entity = await staffCertificateRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (entity == null || entity.Status == StaffCertificateConst.STATUS_DELETED)
                return Result<object>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_CERTIFICATE_NOT_FOUND);

            if (request.CertificateTypeId.HasValue && request.CertificateTypeId != entity.CertificateTypeId)
            {
                var certType = await certificateTypeRepository.FindByIdAsync(request.CertificateTypeId.Value, true, cancellationToken);
                if (certType == null || certType.Status == CertificateTypeConst.STATUS_DELETED)
                    return Result<object>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);
                entity.CertificateTypeId = request.CertificateTypeId.Value;
            }

            if (request.CertificateName != null) entity.CertificateName = request.CertificateName;
            if (request.IssuingOrganization != null) entity.IssuingOrganization = request.IssuingOrganization;
            if (request.IssuedDate != null) entity.IssuedDate = DateOnly.Parse(request.IssuedDate);
            entity.ExpiryDate = string.IsNullOrEmpty(request.ExpiryDate) ? null : DateOnly.Parse(request.ExpiryDate);
            entity.CertificateNumber = request.CertificateNumber;
            entity.DocumentUrl = request.DocumentUrl;
            entity.Note = request.Note;
            if (request.Status.HasValue) entity.Status = request.Status.Value;
            entity.UpdatedAt = DateTime.UtcNow;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staffCertificateRepository.Update(entity);
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
