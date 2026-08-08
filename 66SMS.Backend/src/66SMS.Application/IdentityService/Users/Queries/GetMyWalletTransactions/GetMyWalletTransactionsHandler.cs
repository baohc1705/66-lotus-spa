using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Users.Queries.GetMyWalletTransactions
{
    public class GetMyWalletTransactionsHandler : IRequestHandler<GetMyWalletTransactionsQuery, Result<IEnumerable<MyWalletTransactionDto>>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IWalletSqlRepository walletSqlRepository;
        private readonly IWalletTransactionSqlRepository walletTransactionSqlRepository;

        public GetMyWalletTransactionsHandler(
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            IWalletTransactionSqlRepository walletTransactionSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.walletSqlRepository = walletSqlRepository;
            this.walletTransactionSqlRepository = walletTransactionSqlRepository;
        }

        public async Task<Result<IEnumerable<MyWalletTransactionDto>>> Handle(GetMyWalletTransactionsQuery request, CancellationToken cancellationToken)
        {
            var emptyList = Enumerable.Empty<MyWalletTransactionDto>();

            var customerId = await userSqlRepository.AsQueryable(asNoTracking: true)
                .Where(u => u.Id == request.UserId)
                .Select(u => u.Customer != null ? (int?)u.Customer.Id : null)
                .FirstOrDefaultAsync(cancellationToken);

            if (customerId == null)
                return Result<IEnumerable<MyWalletTransactionDto>>.Success(emptyList);

            var walletId = await walletSqlRepository.AsQueryable(asNoTracking: true)
                .Where(w => w.CustomerId == customerId.Value)
                .Select(w => (int?)w.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (walletId == null)
                return Result<IEnumerable<MyWalletTransactionDto>>.Success(emptyList);

            var transactions = await walletTransactionSqlRepository.AsQueryable(asNoTracking: true)
                .Where(t => t.WalletId == walletId.Value)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new MyWalletTransactionDto
                {
                    Id = t.Id,
                    Amount = t.Amount,
                    Type = t.Type,
                    Note = t.Note,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return Result<IEnumerable<MyWalletTransactionDto>>.Success(transactions);
        }
    }
}
