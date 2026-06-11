using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ProductImages.Commands.CreateProductImages
{
    public class CreateProductImageCommand : IRequest<Result<int>>
    {
        public int ProductId { get; set; }
        public string Url { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
    }
}
