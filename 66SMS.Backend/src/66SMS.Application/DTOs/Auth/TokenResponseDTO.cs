using _66SMS.Contract.Shared;

namespace _66SMS.Application.DTOs.Auth
{
    public class TokenResponseDTO
    {
        public int UserId { get; set; }
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        // public int? ManagedSalonId { get; set; } Lấy từ UserProfile
        public TokenUserProfileDto? UserProfile { get; set; } = null!;
    }
}
