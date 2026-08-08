using _66SMS.Contract.Shared;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories
{
    /// <summary>
    /// Create new <see cref="ServiceCategory"/> request
    /// </summary>
    public class CreateServiceCategoriesCommand : IRequest<Result<object>>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
        public string? Icon { get; set; }
        public string? ImageUrl { get; set; }
    }
}
