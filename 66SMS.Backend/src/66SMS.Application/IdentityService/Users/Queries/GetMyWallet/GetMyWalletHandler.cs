using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Users.Queries.GetMyWallet
{
    public class GetMyWalletHandler : IRequestHandler<GetMyWalletQuery, Result<MyWalletDto>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IWalletSqlRepository walletSqlRepository;

        public GetMyWalletHandler(IUserSqlRepository userSqlRepository, IWalletSqlRepository walletSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.walletSqlRepository = walletSqlRepository;
        }

        public async Task<Result<MyWalletDto>> Handle(GetMyWalletQuery request, CancellationToken cancellationToken)
        {
            var customerId = await userSqlRepository.AsQueryable(asNoTracking: true)
                .Where(u => u.Id == request.UserId)
                .Select(u => u.Customer != null ? (int?)u.Customer.Id : null)
                .FirstOrDefaultAsync(cancellationToken);

            if (customerId == null)
                return Result<MyWalletDto>.Success(new MyWalletDto { Balance = 0 });

            var balance = await walletSqlRepository.AsQueryable(asNoTracking: true)
                .Where(w => w.CustomerId == customerId.Value)
                .Select(w => (decimal?)w.Balance)
                .FirstOrDefaultAsync(cancellationToken);

            return Result<MyWalletDto>.Success(new MyWalletDto
            {
                Balance = balance ?? 0
            });
        }
    }
}
