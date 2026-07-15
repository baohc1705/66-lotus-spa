using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Domain.Entities
{
    public class OtpVerification : EntityBase<int>
    {
        public int UserId { get; set; }
        public string OtpCode { get; set; } = null!;
        public DateTimeOffset ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public bool IsExpired => ExpiresAt.IsExpired();
        public bool IsValid => !IsUsed && !IsExpired;

        public User? User { get; set; }
    }
}
