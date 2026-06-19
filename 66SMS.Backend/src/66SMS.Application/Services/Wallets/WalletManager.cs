using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

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
                .Include(u => u.Staff)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null)
            {
                throw new Exception("Không tìm thấy User.");
            }

            Customer customer;
            if (user.Customer == null)
            {
                // Auto create Customer for users (e.g. staff/admin) who don't have one
                customer = new Customer
                {
                    UserId = user.Id,
                    FullName = user.Staff?.FullName ?? user.Username ?? "User",
                    Phone = user.Staff?.Phone,
                    Status = CustomerConst.STATUS_ACTIVED,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
            }
            else
            {
                customer = user.Customer;
            }

            // Find existing wallet
            Wallet? wallet = null;
            if (customer.Id > 0)
            {
                wallet = await walletSqlRepository.AsQueryable()
                    .FirstOrDefaultAsync(w => w.CustomerId == customer.Id, cancellationToken);
            }

            if (wallet == null)
            {
                // Auto create wallet
                wallet = new Wallet
                {
                    Customer = customer,
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                
                if (customer.Id > 0)
                {
                    wallet.CustomerId = customer.Id;
                }

                walletSqlRepository.Add(wallet);
                // Note: Call SaveChangeAsync() on unit of work outside of this method!
            }

            return wallet;
        }
    }
}
