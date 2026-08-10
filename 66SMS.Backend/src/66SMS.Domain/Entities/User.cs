using _66SMS.Domain.Abstractions.Entities;
using System.Text.Json.Serialization;

namespace _66SMS.Domain.Entities
{
    public class User : EntityBase<int>
    {
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public bool IsEmailConfirmed { get; set; } = false;
        public int AccessFailedCount { get; set; } = 0;
        public int Status { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public DateTimeOffset? LastLoginAt { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTimeOffset? PasswordResetTokenExpiry { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public string? OtpCode { get; set; }

        public List<UserRole>? UserRoles { get; set; }
        public List<RefreshToken>? RefreshTokens { get; set; }
      
        public Customer? Customer { get; set; }
        public Staff? Staff { get; set; }
    }
}
