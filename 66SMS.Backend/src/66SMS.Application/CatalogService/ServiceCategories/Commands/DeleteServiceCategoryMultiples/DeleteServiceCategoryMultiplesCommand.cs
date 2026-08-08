using MediatR;
using _66SMS.Contract.Shared;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategoryMultiples
{
    public class DeleteServiceCategoryMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();
    }
}
