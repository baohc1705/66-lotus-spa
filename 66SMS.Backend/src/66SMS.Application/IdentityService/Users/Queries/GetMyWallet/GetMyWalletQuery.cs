using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetMyWallet
{
    public class GetMyWalletQuery : IRequest<Result<MyWalletDto>>
    {
        public int UserId { get; set; }
    }

    public class MyWalletDto
    {
        public decimal Balance { get; set; }
    }
}
