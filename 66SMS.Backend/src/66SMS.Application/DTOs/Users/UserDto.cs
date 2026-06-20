namespace _66SMS.Application.DTOs.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; } = false;
        public string Status { get; set; }
        public string? LockoutEnd { get; set; }
        public string? LastLoginAt { get; set; }
        public List<string>? Roles { get; set; }
        public List<string>? Permissions { get; set; }

        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Phone { get; set; }
        public int? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        
        public string ProfileType { get; set; } = "None";

        public StaffProfileDto? StaffInfo { get; set; }
        public CustomerProfileDto? CustomerInfo { get; set; }
    }

    public class StaffProfileDto 
    {
        public string? Code { get; set; }
        public string? NationalId { get; set; }
        public DateOnly? HireDate { get; set; }
        public string? ContractType { get; set; }
    }

    public class CustomerProfileDto
    {
        public int? LoyaltyPoint { get; set; }
        public DateTime? FirstPurchaseAt { get; set; }
        public string? Source { get; set; }
    }
}
