using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.UpdateServiceCategories
{
    /// <summary>
    /// Upadte service category request
    /// </summary>
    public class UpdateServiceCategoriesCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public string? Icon { get; set; }
    }
}
