using _66SMS.Application.DTOs.Wallets;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.CustomerService.Wallets.Queries.GetWalletTransactions
{
    public class GetWalletTransactionsQuery : IRequest<Result<IEnumerable<AdminWalletTransactionDto>>>
    {
        public int WalletId { get; set; }
    }
}
