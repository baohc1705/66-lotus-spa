using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ServiceCategories.Commands.UpdateServiceCategories
{
    public class UpdateServiceCategoriesCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
