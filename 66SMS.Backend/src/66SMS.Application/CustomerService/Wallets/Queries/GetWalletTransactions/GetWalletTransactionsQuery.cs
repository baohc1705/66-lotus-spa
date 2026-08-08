using _66SMS.Application.DTOs.Wallets;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Wallets.Queries.GetWalletTransactions
{
    public class GetWalletTransactionsQuery : IRequest<Result<IEnumerable<AdminWalletTransactionDto>>>
    {
        public int WalletId { get; set; }
    }
}
