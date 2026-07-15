using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Staff : EntityBase<int>
    {
        public int UserId { get; set; }
        public string? Code { get; set; }
        public string FullName { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public DateOnly? HireDate { get; set; }
        public string? ContractType { get; set; }
        public decimal? BasicSalary { get; set; }
        public int SalaryType { get; set; }
        public int Status { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public User? User { get; set; }
        public List<StaffSalon>? StaffSalons { get; set; }
        public List<StaffService>? StaffServices { get; set; }
    }
}
