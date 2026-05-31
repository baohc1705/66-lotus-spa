namespace _66SMS.Application.DTOs.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; } = false;
        public string Status { get; set; }
        public string? LogoutEnd { get; set; }
        public string? LastLoginAt { get; set; }
        public List<string>? Roles { get; set; }
        public List<string>? Permissions { get; set; }
    }
}
