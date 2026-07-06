using MediatR;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Enumerations;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificateMultiples
{
    public class DeleteStaffCertificateMultiplesHandler : IRequestHandler<DeleteStaffCertificateMultiplesCommand, Result<object>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteStaffCertificateMultiplesHandler(IStaffCertificateSqlRepository staffCertificateSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.staffCertificateSqlRepository = staffCertificateSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteStaffCertificateMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingCerts = await staffCertificateSqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingCerts.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_CERTIFICATE_NOT_FOUND);
            }

            var now = DateTime.UtcNow;
            foreach (var cert in existingCerts)
            {
                cert.Status = StaffCertificateConst.STATUS_DELETED;
                cert.UpdatedAt = now;
                staffCertificateSqlRepository.Update(cert);
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
