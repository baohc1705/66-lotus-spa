using _66SMS.Application.DTOs.Wallets;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Wallets.Queries.GetWalletTransactions
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
                .ToListAsync(cancellationToken);

            // Fetch creators (staffs/admins who created the transaction)
            var userIds = transactions.Where(t => t.CreatedBy.HasValue).Select(t => t.CreatedBy.Value).Distinct().ToList();
            var users = await userRepository.AsQueryable(asNoTracking: true)
                .Include(u => u.Staff)
                .Include(u => u.Customer)
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, cancellationToken);

            var dtos = transactions.Select(t => {
                string createdByName = "Hệ thống";
                if (t.CreatedBy.HasValue && users.TryGetValue(t.CreatedBy.Value, out var user))
                {
                    createdByName = user.Staff?.FullName ?? user.Customer?.FullName ?? user.Username;
                }

                return new AdminWalletTransactionDto
                {
                    Id = t.Id,
                    WalletId = t.WalletId,
                    AppointmentPaymentId = t.AppointmentPaymentId,
                    Amount = t.Amount,
                    BalanceAfter = t.BalanceAfter,
                    Type = t.Type,
                    Note = t.Note,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    CreatedBy = t.CreatedBy,
                    CreatedByName = createdByName
                };
            }).ToList();

            return Result<IEnumerable<AdminWalletTransactionDto>>.Success(dtos);
        }
    }
}
