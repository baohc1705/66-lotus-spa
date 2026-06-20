using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceImages.Commands.CreateServiceImages
{
    public class CreateServiceImagesCommand : IRequest<Result<object>>
    {
        public int ServiceId { get; set; }
        public string Url { get; set; } = null!;
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
    }
}
