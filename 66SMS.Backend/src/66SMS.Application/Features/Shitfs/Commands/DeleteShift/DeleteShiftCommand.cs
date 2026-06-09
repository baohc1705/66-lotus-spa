using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Shitfs.Commands.DeleteShift
{
    public record DeleteShiftCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
