using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Payrolls.Commands.UpdatePayroll
{
    public record UpdatePayrollCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public decimal? BaseAmount { get; set; }
        public decimal? CommissionAmount { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
