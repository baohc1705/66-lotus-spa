using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ServiceImages.Commands.CreateServiceImages
{
    public class CreateServiceImagesCommand : IRequest<Result<object>>
    {
        public int ServiceId { get; set; }
        public string Url { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
    }
}
