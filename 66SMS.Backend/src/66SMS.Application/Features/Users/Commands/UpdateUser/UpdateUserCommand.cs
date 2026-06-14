using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Users.Commands.UpdateUser
{
    public class UpdateUserCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public bool? IsEmailConfirmed { get; set; }
        public int? AccessFailedCount { get; set; }
        public int? Status { get; set; }
        public DateTime? LockoutEnd { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
