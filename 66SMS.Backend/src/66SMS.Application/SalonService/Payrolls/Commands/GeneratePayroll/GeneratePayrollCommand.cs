using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Payrolls.Commands.GeneratePayroll
{
    public record GeneratePayrollCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        /// <summary>true = trừ cả T7 khi tính ngày công chuẩn; false = chỉ trừ CN.</summary>
        public bool? ExcludeSaturday { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
