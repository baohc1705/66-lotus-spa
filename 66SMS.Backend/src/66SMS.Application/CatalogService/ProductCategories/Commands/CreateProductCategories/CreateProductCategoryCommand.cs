using _66SMS.Contract.Shared;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories
{
    /// <summary>
    /// Create product category request
    /// </summary>
    public class CreateProductCategoryCommand : IRequest<Result<int>>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
    }
}
