using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class User : EntityAuditTable<int>
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public int AccessFailedCount { get; set; }
        public bool LogoutEnabled { get; set; }
        public DateTime? LogoutEnd { get; set; }
        public DateTime? LastLoginAt { get; set; }

        public List<UserRole>? UserRoles { get; set; }
        public List<RefreshToken>? RefreshTokens { get; set; }
    }
}
