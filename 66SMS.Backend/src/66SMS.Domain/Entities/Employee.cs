using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Domain.Enums;

namespace _66SMS.Domain.Entities
{
    public class Employee : EntityAuditTable<int>
    {
        public int UserId { get; set; }
        public string Code { get; set; }
        public string FullName { get; set; }
        public string? Image { get; set; }
        public DateOnly? Dob { get; set; }
        public GenderConst? Gender { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public DateOnly? HireDate { get; set; }
        public string? ContractType { get; set; }
        public decimal? BasicSalary { get; set; }
        public CustomerStatus? Status { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }

        public User? User { get; set; }
    }
}
