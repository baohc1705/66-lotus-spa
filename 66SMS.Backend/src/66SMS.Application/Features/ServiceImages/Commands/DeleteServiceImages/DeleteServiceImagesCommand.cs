using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ServiceImages.Commands.DeleteServiceImages
{
    public class DeleteServiceImagesCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
