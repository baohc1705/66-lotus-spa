using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Abstractions;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.CreateStaffCertificate
{
    public class CreateStaffCertificateHandler : IRequestHandler<CreateStaffCertificateCommand, Result<int>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateRepository;
        private readonly IStaffSqlRepository staffRepository;
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IImageUploadService imageUploadService;
        private readonly IMapper mapper;

        public CreateStaffCertificateHandler(
            IStaffCertificateSqlRepository staffCertificateRepository,
            IStaffSqlRepository staffRepository,
            ICertificateTypeSqlRepository certificateTypeRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IImageUploadService imageUploadService,
            IMapper mapper)
        {
            this.staffCertificateRepository = staffCertificateRepository;
            this.staffRepository = staffRepository;
            this.certificateTypeRepository = certificateTypeRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.imageUploadService = imageUploadService;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateStaffCertificateCommand request, CancellationToken cancellationToken)
        {
            // Staff tự nộp: lấy staff theo user đang login
            if (request.UserId.HasValue && request.UserId.Value > 0)
            {
                var myStaffId = await staffRepository.AsQueryable(asNoTracking: true)
                    .Where(x => x.UserId == request.UserId.Value && x.Status != StaffConst.STATUS_DELETED)
                    .Select(x => (int?)x.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (myStaffId == null)
                    return Result<int>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

                request.StaffId = myStaffId.Value;
                request.Status = StaffCertificateConst.STATUS_PENDING_VERIFICATION;
            }

            var staff = await staffRepository.FindByIdAsync((int)request.StaffId!, true, cancellationToken);
            if (staff == null)
                return Result<int>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var certType = await certificateTypeRepository.FindByIdAsync((int)request.CertificateTypeId!, true, cancellationToken);
            if (certType == null || certType.Status == CertificateTypeConst.STATUS_DELETED)
                return Result<int>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);

            StaffCertificate entity = mapper.Map<StaffCertificate>(request);
            entity.CreatedAt = request.CreatedAt ?? DateTimeHelper.UtcNow();
            entity.Status = request.Status ?? StaffCertificateConst.STATUS_PENDING_VERIFICATION;
            entity.DocumentUrl = string.IsNullOrWhiteSpace(request.ImageBase64) ? request.DocumentUrl : null;

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
