using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.UpdateStaffCertificate
{
    public record UpdateStaffCertificateCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public int? CertificateTypeId { get; set; }
        public string? CertificateName { get; set; }
        public string? CertificateNumber { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? IssuedDate { get; set; }
        public string? ExpiryDate { get; set; }
        public string? DocumentUrl { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
