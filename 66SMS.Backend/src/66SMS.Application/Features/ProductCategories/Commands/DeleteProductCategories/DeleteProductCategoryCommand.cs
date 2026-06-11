using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ProductCategories.Commands.DeleteProductCategories
{
    public class DeleteProductCategoryCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
