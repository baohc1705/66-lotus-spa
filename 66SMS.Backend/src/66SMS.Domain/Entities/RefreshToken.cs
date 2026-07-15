using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Domain.Entities
{
    public class RefreshToken : EntityBase<int>
    {
        public int UserId { get; set; }
        public string Token { get; set; } = null!;
        public DateTimeOffset ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public string? CreatedByIp { get; set; }
        public string? RevokedByIp { get; set; }
        public DateTimeOffset? RevokedAt { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public bool IsExpired => ExpiresAt.IsExpired();
        public bool IsActive => RevokedAt == null && !IsExpired;

        public User? User { get; set; }
    }
}
