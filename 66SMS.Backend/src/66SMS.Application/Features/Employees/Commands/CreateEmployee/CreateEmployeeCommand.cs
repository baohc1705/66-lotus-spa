using _66SMS.Contracts.Shared;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Employees.Commands.CreateEmployee
{
    public record CreateEmployeeCommand : IRequest<Result<object>>
    {
        // Profile
        [JsonIgnore]
        public int? UserId { get; set; }
        public string? FullName { get; set; }
        public string? Image { get; set; }
        public DateOnly? Dob { get; set; }
        public int? Gender { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public DateOnly? HireDate { get; set; }
        public string? ContractType { get; set; }
        public decimal? BasicSalary { get; set; }
        public int? Status { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }

        // Account
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }

        [JsonIgnore]
        public string? Role { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
