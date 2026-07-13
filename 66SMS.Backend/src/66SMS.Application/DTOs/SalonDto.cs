namespace _66SMS.Application.DTOs
{
    public class SalonDto
    {
        public int? Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? WorkingDays { get; set; }
        public string? TaxCode { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
    }
}
