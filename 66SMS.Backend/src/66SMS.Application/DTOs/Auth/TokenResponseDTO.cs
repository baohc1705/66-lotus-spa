namespace _66SMS.Application.DTOs.Auth
{
    public class TokenResponseDTO
    {
        public int UserId { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public int? ManagedSalonId { get; set; }
    }
}
