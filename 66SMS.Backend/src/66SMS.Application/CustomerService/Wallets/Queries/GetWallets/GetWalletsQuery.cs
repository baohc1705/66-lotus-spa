using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Wallets.Queries.GetWallets
{
    public class GetWalletsQuery : PageRequest, IRequest<Result<PagedResult<AdminWalletDto>>>
    {
        public int? CustomerId { get; set; }
    }
}
