using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.CustomerService.Wallets.Queries.GetWallets
{
    public class GetWalletsHandler : IRequestHandler<GetWalletsQuery, Result<PagedResult<AdminWalletDto>>>
    {
        private readonly IWalletSqlRepository walletRepository;

        public GetWalletsHandler(IWalletSqlRepository walletRepository)
        {
            this.walletRepository = walletRepository;
        }

        public async Task<Result<PagedResult<AdminWalletDto>>> Handle(GetWalletsQuery request, CancellationToken cancellationToken)
        {
            var query = walletRepository.AsQueryable(asNoTracking: true);

            if (request.CustomerId.HasValue)
                query = query.Where(x => x.CustomerId == request.CustomerId.Value);

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x =>
                    (x.Customer != null && x.Customer.FullName.Contains(request.Filter))
                    || (x.Customer != null && x.Customer.Phone != null && x.Customer.Phone.Contains(request.Filter)));
            }

            query = request.OrderBy?.ToLower() switch
            {
                "balance" => request.IsDescending ? query.OrderByDescending(x => x.Balance) : query.OrderBy(x => x.Balance),
                "customername" => request.IsDescending
                    ? query.OrderByDescending(x => x.Customer!.FullName)
                    : query.OrderBy(x => x.Customer!.FullName),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            };

            var paged = await query
                .Select(w => new AdminWalletDto
                {
                    Id = w.Id,
                    CustomerId = w.CustomerId,
                    CustomerName = w.Customer!.FullName,
                    CustomerPhone = w.Customer.Phone,
                    CustomerAvatar = w.Customer.AvatarUrl,
                    Balance = w.Balance,
                    Status = w.Status,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = null,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<AdminWalletDto>>.Success(paged);
        }
    }
}
