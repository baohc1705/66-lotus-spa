using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.UpdateRole
{
    public class UpdateRoleCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
