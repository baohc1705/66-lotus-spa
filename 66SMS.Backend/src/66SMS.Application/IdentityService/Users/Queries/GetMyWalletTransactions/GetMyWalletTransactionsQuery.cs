using _66SMS.Contract.Shared;
using MediatR;  

namespace _66SMS.Application.IdentityService.Users.Queries.GetMyWalletTransactions
{
    public class GetMyWalletTransactionsQuery : IRequest<Result<IEnumerable<MyWalletTransactionDto>>>
    {
        public int UserId { get; set; }
    }

    public class MyWalletTransactionDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public int Type { get; set; }
        public string? Note { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
