namespace _66SMS.Application.DTOs.Identity
{
    public class TokenResponseDTO
    {
        public int UserId { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}
