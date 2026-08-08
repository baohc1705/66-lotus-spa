using _66SMS.Application.DTOs.Wallets;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CustomerService.Wallets.Queries.GetWallets
{
    public class GetWalletsHandler : IRequestHandler<GetWalletsQuery, Result<IEnumerable<AdminWalletDto>>>
    {
        private readonly IWalletSqlRepository walletRepository;

        public GetWalletsHandler(IWalletSqlRepository walletRepository)
        {
            this.walletRepository = walletRepository;
        }

        public async Task<Result<IEnumerable<AdminWalletDto>>> Handle(GetWalletsQuery request, CancellationToken cancellationToken)
        {
            var wallets = await walletRepository.AsQueryable(asNoTracking: true)
                .Include(w => w.Customer)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new AdminWalletDto
                {
                    Id = w.Id,
                    CustomerId = w.CustomerId,
                    CustomerName = w.Customer!.FullName ?? "N/A",
                    CustomerPhone =  w.Customer.Phone ?? "N/A",
                    CustomerAvatar =  w.Customer!.AvatarUrl ?? "N/A",
                    Balance = w.Balance,
                    Status = w.Status,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = null
                })
                .ToListAsync(cancellationToken);

            return Result<IEnumerable<AdminWalletDto>>.Success(wallets);
        }
    }
}
