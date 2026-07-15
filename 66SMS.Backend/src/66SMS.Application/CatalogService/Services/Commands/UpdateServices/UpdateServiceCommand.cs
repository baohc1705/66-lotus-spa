using _66SMS.Application.CatalogService.Services.Commands.CreateServices;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.Services.Commands.UpdateServices
{
    /// <summary>
    /// Update service request
    /// </summary>
    public class UpdateServiceCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
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
        /// <summary>
        /// Khi gửi (kể cả rỗng): xóa sản phẩm cũ và thêm lại danh sách mới.
        /// Null = không đụng tới sản phẩm đi kèm.
        /// </summary>
        public List<ServiceProductItems>? ServiceProducts { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
