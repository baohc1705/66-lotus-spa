using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Payrolls.Commands.UpdatePayroll
{
    public record UpdatePayrollCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
