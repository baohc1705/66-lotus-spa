namespace _66SMS.Application.DTOs
{
    public class StaffCertificateDTO
    {
        public int? Id { get; set; }
        public int? StaffId { get; set; }
        public string? StaffName { get; set; }
        public int? CertificateTypeId { get; set; }
        public string? TypeName { get; set; }
        public string? CertificateName { get; set; }
        public string? CertificateNumber { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? IssuedDate { get; set; }
        public string? ExpiryDate { get; set; }
        public string? DocumentUrl { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
