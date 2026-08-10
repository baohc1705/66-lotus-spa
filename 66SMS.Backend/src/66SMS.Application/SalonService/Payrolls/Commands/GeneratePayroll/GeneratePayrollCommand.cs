using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Payrolls.Commands.GeneratePayroll
{
    public record GeneratePayrollCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public bool? ExcludeSaturday { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
