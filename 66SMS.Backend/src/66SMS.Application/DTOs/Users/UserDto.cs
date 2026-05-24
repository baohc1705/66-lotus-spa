namespace _66SMS.Application.DTOs.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public bool LogoutEnabled { get; set; }
        public DateTime? LogoutEnd { get; set; }
        public DateTime? LastLoginAt { get; set; }

    }
}
