namespace _66SMS.Application.DTOs
{
    /// <summary>
    /// Lightweight DTO for list/table display (GetAll).
    /// </summary>
    public class ServiceListDto
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public int? DurationMins { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public int? Status { get; set; }
        public string? ImageUrl { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Full DTO for expand detail and edit form (GetDetail).
    /// </summary>
    public class ServiceDetailDto
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? DurationMins { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public string? ImageUrl { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public List<ServiceProductResponse>? ServiceProducts { get; set; }
    }

    public class ServiceProductResponse
    {
        public int? Id { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? SellingPrice { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
