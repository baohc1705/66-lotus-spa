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
            var user = await userSqlRepository.AsQueryable(asNoTracking: true)
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            var emptyList = Enumerable.Empty<MyWalletTransactionDto>();

            if (user == null || user.Customer == null)
            {
                return Result<IEnumerable<MyWalletTransactionDto>>.Success(emptyList);
            }

            var wallet = await walletSqlRepository.AsQueryable(asNoTracking: true)
                .FirstOrDefaultAsync(w => w.CustomerId == user.Customer.Id, cancellationToken);

            if (wallet == null)
            {
                return Result<IEnumerable<MyWalletTransactionDto>>.Success(emptyList);
            }

            var transactions = await walletTransactionSqlRepository.AsQueryable(asNoTracking: true)
                .Where(t => t.WalletId == wallet.Id)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new MyWalletTransactionDto
                {
                    Id = t.Id,
                    Amount = t.Amount,
                    Note = t.Note,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return Result<IEnumerable<MyWalletTransactionDto>>.Success(transactions);
        }
    }
}
