using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.CreateStaffCertificate
{
    public class CreateStaffCertificateHandler : IRequestHandler<CreateStaffCertificateCommand, Result<int>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateRepository;
        private readonly IStaffSqlRepository staffRepository;
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IImageUploadService imageUploadService;

        public CreateStaffCertificateHandler(
            IStaffCertificateSqlRepository staffCertificateRepository,
            IStaffSqlRepository staffRepository,
            ICertificateTypeSqlRepository certificateTypeRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IImageUploadService imageUploadService)
        {
            this.staffCertificateRepository = staffCertificateRepository;
            this.staffRepository = staffRepository;
            this.certificateTypeRepository = certificateTypeRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<int>> Handle(CreateStaffCertificateCommand request, CancellationToken cancellationToken)
        {
            var staff = await staffRepository.FindByIdAsync((int)request.StaffId!, true, cancellationToken);
            if (staff == null)
                return Result<int>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var certType = await certificateTypeRepository.FindByIdAsync((int)request.CertificateTypeId!, true, cancellationToken);
            if (certType == null || certType.Status == CertificateTypeConst.STATUS_DELETED)
                return Result<int>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);

            var entity = new StaffCertificate
            {
                StaffId = request.StaffId!.Value,
                CertificateTypeId = request.CertificateTypeId!.Value,
                CertificateName = request.CertificateName!,
                CertificateNumber = request.CertificateNumber,
                IssuingOrganization = request.IssuingOrganization!,
                IssuedDate = DateOnly.Parse(request.IssuedDate!),
                ExpiryDate = string.IsNullOrEmpty(request.ExpiryDate) ? null : DateOnly.Parse(request.ExpiryDate),
                DocumentUrl = string.IsNullOrWhiteSpace(request.ImageBase64) ? request.DocumentUrl : null,
                Note = request.Note,
                Status = request.Status ?? StaffCertificateConst.STATUS_PENDING_VERIFICATION,
                CreatedAt = request.CreatedAt ?? DateTimeHelper.UtcNow(),
            };

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staffCertificateRepository.Add(entity);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    entity.DocumentUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        StaffCertificateConst.GenerateImageFileName(entity.Id),
                        StaffCertificateConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(entity.DocumentUrl))
                    {
                        staffCertificateRepository.Update(entity);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

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
