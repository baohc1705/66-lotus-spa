using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayReturn
{
    public sealed class VnPayReturnCommand : IRequest<Result<VnPayReturnDto>>
    {
        public IDictionary<string, string> QueryData { get; set; } = new Dictionary<string, string>();
    }
}
