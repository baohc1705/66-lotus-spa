using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.DeleteProductImages
{
    public class DeleteProductImageCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
