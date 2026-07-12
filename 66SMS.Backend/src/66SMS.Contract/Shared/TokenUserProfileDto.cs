namespace _66SMS.Contracts.Shared;

public class TokenUserProfileDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public string ProfileType { get; set; } = "none"; // customer | staff | none
    public TokenCustomerProfileDto? CustomerProfile { get; set; }
    public TokenStaffProfileDto? StaffProfile { get; set; }
}

public class TokenCustomerProfileDto
{
    public int CustomerId { get; set; }
    public int? LoyaltyPoint { get; set; }
}

public class TokenStaffProfileDto
{
    public int StaffId { get; set; }
    public string? Code { get; set; }
    public int? SalonId { get; set; }
}
