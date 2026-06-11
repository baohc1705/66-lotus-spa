using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ServiceCategories.Commands.CreateServiceCategories
{
    public class CreateServiceCategoriesCommand : IRequest<Result<object>>
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public int SortOrder { get; set; }
        public int Status { get; set; }
    }
}
