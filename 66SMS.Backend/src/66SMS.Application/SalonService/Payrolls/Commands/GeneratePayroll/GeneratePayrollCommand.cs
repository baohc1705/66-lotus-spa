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

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
