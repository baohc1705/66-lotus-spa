using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Payrolls.Commands.ConfirmPayroll
{
    public record ConfirmPayrollCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
