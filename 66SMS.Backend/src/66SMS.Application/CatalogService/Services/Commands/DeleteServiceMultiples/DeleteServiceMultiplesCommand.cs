using MediatR;
using _66SMS.Contracts.Shared;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServiceMultiples
{
    public class DeleteServiceMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
