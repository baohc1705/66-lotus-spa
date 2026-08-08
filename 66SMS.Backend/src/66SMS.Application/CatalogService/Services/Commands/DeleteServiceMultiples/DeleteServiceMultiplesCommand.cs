using MediatR;
using _66SMS.Contract.Shared;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServiceMultiples
{
    public class DeleteServiceMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();
    }
}
