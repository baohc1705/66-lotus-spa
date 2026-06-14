using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Services.Wallets
{
    public class WalletManager
    {
        public static async Task<Wallet> GetOrCreateWalletAsync(
            int userId,
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            CancellationToken cancellationToken)
        {
            // First, find the User with Customer included
            var user = await userSqlRepository.AsQueryable()
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null || user.Customer == null)
            {
                throw new Exception("Không tìm thấy Khách hàng liên kết với User này.");
            }

            int customerId = user.Customer.Id;

            // Find existing wallet
            var wallet = await walletSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(w => w.CustomerId == customerId, cancellationToken);

            if (wallet == null)
            {
                // Auto create wallet
                wallet = new Wallet
                {
                    CustomerId = customerId,
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                walletSqlRepository.Add(wallet);
                // Note: Call SaveChangeAsync() on unit of work outside of this method!
            }

            return wallet;
        }
    }
}
