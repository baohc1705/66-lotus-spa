using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceImages.Commands.UpdateServiceImages
{
    public class UpdateServiceImagesCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        public int? ServiceId { get; set; }
        public string? Url { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
