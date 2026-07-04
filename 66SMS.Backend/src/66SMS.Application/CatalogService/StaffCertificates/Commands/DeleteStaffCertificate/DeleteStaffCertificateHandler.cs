using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificate
{
    public class DeleteStaffCertificateHandler : IRequestHandler<DeleteStaffCertificateCommand, Result<object>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteStaffCertificateHandler(IStaffCertificateSqlRepository staffCertificateRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.staffCertificateRepository = staffCertificateRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteStaffCertificateCommand request, CancellationToken cancellationToken)
        {
            var entity = await staffCertificateRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (entity == null || entity.Status == StaffCertificateConst.STATUS_DELETED)
                return Result<object>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_CERTIFICATE_NOT_FOUND);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                entity.Status = StaffCertificateConst.STATUS_DELETED;
                entity.UpdatedAt = DateTime.UtcNow;
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
