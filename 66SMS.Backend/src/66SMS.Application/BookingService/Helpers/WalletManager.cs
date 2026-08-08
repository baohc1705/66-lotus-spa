using _66SMS.Contract.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
    public class WalletManager
    {
        public static async Task<Wallet> GetOrCreateWalletAsync(
            int userId,
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            CancellationToken cancellationToken)
        {
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
                customer = new Customer
                {
                    UserId = user.Id,
                    FullName = user.Staff?.FullName ?? user.Username ?? string.Empty,
                    Phone = user.Staff?.Phone,
                    Status = CustomerConst.STATUS_ACTIVED,
                    CreatedAt = DateTimeHelper.UtcNow()
                };
            }
            else
            {
                customer = user.Customer;
            }

            Wallet? wallet = null;
            if (customer.Id > 0)
            {
                wallet = await walletSqlRepository.AsQueryable()
                    .FirstOrDefaultAsync(w => w.CustomerId == customer.Id, cancellationToken);
            }

            if (wallet == null)
            {
                wallet = new Wallet
                {
                    Customer = customer,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTimeHelper.UtcNow()
                };
                if (customer.Id > 0)
                    wallet.CustomerId = customer.Id;
                walletSqlRepository.Add(wallet);
            }

            return wallet;
        }
    }
}
