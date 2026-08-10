namespace _66SMS.Application.DTOs;

public class UserAccountDto
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public bool IsEmailConfirmed { get; set; }
    public int AccessFailedCount { get; set; }
    public int Status { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? Role { get; set; }
}
