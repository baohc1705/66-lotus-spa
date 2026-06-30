using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.CreateCertificateType
{
    public record CreateCertificateTypeCommand : IRequest<Result<int>>
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; } = CertificateTypeConst.STATUS_ACTIVED;

        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
