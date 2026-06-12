using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.ProductCategories.Commands.UpdateProductCategories
{
    public class UpdateProductCategoryCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
