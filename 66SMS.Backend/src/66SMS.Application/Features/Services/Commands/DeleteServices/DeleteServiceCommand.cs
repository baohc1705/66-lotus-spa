using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Services.Commands.DeleteServices
{
    public class DeleteServiceCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
