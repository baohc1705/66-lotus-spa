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
            var user = await userSqlRepository.AsQueryable(asNoTracking: true)
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null || user.Customer == null)
            {
                return Result<MyWalletDto>.Success(new MyWalletDto { Balance = 0 });
            }

            var wallet = await walletSqlRepository.AsQueryable(asNoTracking: true)
                .FirstOrDefaultAsync(w => w.CustomerId == user.Customer.Id, cancellationToken);

            return Result<MyWalletDto>.Success(new MyWalletDto
            {
                Balance = wallet?.Balance ?? 0
            });
        }
    }
}
