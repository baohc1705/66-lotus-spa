using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Wallets.Commands.ManualWalletTransaction
{
    public class ManualWalletTransactionCommand : IRequest<Result<object>>
    {
        public int WalletId { get; set; }
        public decimal Amount { get; set; } // Can be positive (deposit) or negative (deduct)
        public string Note { get; set; } = null!;
        public int UserId { get; set; } // Admin/Staff user performing this
    }
}
