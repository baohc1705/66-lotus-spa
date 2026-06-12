using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Users.Commands.DeleteUser
{
    public class DeleteUserCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public List<int>? Ids { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
