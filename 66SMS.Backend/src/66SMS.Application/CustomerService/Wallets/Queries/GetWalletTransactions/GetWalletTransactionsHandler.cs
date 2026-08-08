using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CustomerService.Wallets.Queries.GetWalletTransactions
{
    public class GetWalletTransactionsHandler : IRequestHandler<GetWalletTransactionsQuery, Result<IEnumerable<AdminWalletTransactionDto>>>
    {
        private readonly IWalletTransactionSqlRepository transactionRepository;
        private readonly IUserSqlRepository userRepository;

        public GetWalletTransactionsHandler(IWalletTransactionSqlRepository transactionRepository, IUserSqlRepository userRepository)
        {
            this.transactionRepository = transactionRepository;
            this.userRepository = userRepository;
        }

        public async Task<Result<IEnumerable<AdminWalletTransactionDto>>> Handle(GetWalletTransactionsQuery request, CancellationToken cancellationToken)
        {
            var transactions = await transactionRepository.AsQueryable(asNoTracking: true)
                .Where(t => t.WalletId == request.WalletId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new AdminWalletTransactionDto
                {
                    Id = t.Id,
                    WalletId = t.WalletId,
                    AppointmentPaymentId = t.AppointmentPaymentId,
                    Amount = t.Amount,
                    BalanceAfter = t.BalanceAfter,
                    Type = t.Type,
                    Note = t.Note!,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    CreatedBy = t.CreatedBy,
                    CreatedByName = string.Empty,
                })
                .ToListAsync(cancellationToken);

            var userIds = transactions
                .Where(t => t.CreatedBy.HasValue)
                .Select(t => t.CreatedBy!.Value)
                .Distinct()
                .ToList();

            if (userIds.Count > 0)
            {
                var namesByUserId = await userRepository.AsQueryable(asNoTracking: true)
                    .Where(u => userIds.Contains(u.Id))
                    .Select(u => new
                    {
                        u.Id,
                        Name = u.Staff != null
                            ? u.Staff.FullName
                            : (u.Customer != null ? u.Customer.FullName : u.Username),
                    })
                    .ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);

                foreach (var t in transactions)
                {
                    if (t.CreatedBy.HasValue && namesByUserId.TryGetValue(t.CreatedBy.Value, out var name))
                        t.CreatedByName = name;
                }
            }

            return Result<IEnumerable<AdminWalletTransactionDto>>.Success(transactions);
        }
    }
}
