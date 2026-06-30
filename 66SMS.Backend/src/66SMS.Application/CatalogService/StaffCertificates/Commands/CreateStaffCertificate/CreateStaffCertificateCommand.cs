using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.CreateStaffCertificate
{
    public record CreateStaffCertificateCommand : IRequest<Result<int>>
    {
        public int? StaffId { get; set; }
        public int? CertificateTypeId { get; set; }
        public string? CertificateName { get; set; }
        public string? CertificateNumber { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? IssuedDate { get; set; }
        public string? ExpiryDate { get; set; }
        public string? DocumentUrl { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; } = StaffCertificateConst.STATUS_PENDING_VERIFICATION;

        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
