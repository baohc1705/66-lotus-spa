using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificate
{
    public class DeleteStaffCertificateCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
