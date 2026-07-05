using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories
{
    /// <summary>
    /// Create product category request
    /// </summary>
    public class CreateProductCategoryCommand : IRequest<Result<int>>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;

        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
