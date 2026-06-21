using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategories
{
    /// <summary>
    /// Delete service category 
    /// </summary>
    public class DeleteServiceCategoriesCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
