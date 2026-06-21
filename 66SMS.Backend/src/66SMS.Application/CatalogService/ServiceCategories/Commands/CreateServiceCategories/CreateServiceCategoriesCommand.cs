using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories
{
    /// <summary>
    /// Create new <see cref="ServiceCategory"/> request
    /// </summary>
    public class CreateServiceCategoriesCommand : IRequest<Result<object>>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = ServiceCategoryConst.STATUS_ACTIVED;
        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
