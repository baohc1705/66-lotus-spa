using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetWalletTopUpVnPayUrl
{
    public class GetWalletTopUpVnPayUrlQuery : IRequest<Result<string>>
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string? IpAddress { get; set; }
    }
}
