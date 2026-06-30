using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Staffs.Commands.CreateStaff
{
    public record CreateStaffCommand : IRequest<Result<object>>
    {
        // Profile
        public int? SalonId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public DateOnly? HireDate { get; set; }
        public string? ContractType { get; set; }
        public decimal? BasicSalary { get; set; }
        public int? SalaryType { get; set; } = StaffConst.SALARY_TYPE_DAILY;
        public int? Status { get; set; } = StaffConst.STATUS_ACTIVED;
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }

        public string? Role { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        public string? Email { get; set; }
    }
}
