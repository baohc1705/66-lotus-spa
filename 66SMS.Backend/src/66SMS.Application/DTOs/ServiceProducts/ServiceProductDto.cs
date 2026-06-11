using _66SMS.Application.DTOs.Products;

namespace _66SMS.Application.DTOs.ServiceProducts
{
    public class ServiceProductDto
    {
        public int? Id { get; set; }
        public int? ServiceId { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }

        public ProductDto? Product { get; set; }
    }
}
