using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories
{
    /// <summary>
    /// Update product category request
    /// </summary>
    public class UpdateProductCategoryCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
