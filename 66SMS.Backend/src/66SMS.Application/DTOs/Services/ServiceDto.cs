namespace _66SMS.Application.DTOs.Services
{
    public class ServiceDto
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? DurationMins { get; set; }
        public decimal? Price { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }

        public List<ServiceImageResponse>? Images { get; set; }
        public List<ServiceProductResponse>? ServiceProducts { get; set; }
    }

    public class ServiceImageResponse
    {
        public int? Id { get; set; }
        public string? Url { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }

    public class ServiceProductResponse
    {
        public int? Id { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
