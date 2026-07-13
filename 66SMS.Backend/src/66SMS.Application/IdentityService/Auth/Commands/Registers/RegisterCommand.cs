using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Enums;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Auth.Commands.Registers
{
    /// <summary>
    /// Regiter new customer or user request
    /// </summary>
    public class RegisterCommand : IRequest<Result<int>>
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
    }
}
