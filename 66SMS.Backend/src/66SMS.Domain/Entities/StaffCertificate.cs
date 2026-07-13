using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class StaffCertificate : EntityBase<int>
    {
        public int StaffId { get; set; }
        public int CertificateTypeId { get; set; }
        public string CertificateName { get; set; } = null!;
        public string? CertificateNumber { get; set; }
        public string IssuingOrganization { get; set; } = null!;
        public DateOnly IssuedDate { get; set; }
        public DateOnly? ExpiryDate { get; set; }
        public string? DocumentUrl { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public Staff? Staff { get; set; }
        public CertificateType? CertificateType { get; set; }
    }
}
