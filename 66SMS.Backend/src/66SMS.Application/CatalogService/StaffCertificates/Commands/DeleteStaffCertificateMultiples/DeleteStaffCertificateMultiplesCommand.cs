using MediatR;
using _66SMS.Contracts.Shared;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificateMultiples
{
    public class DeleteStaffCertificateMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
