using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffMultiples
{
    public class DeleteStaffMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
