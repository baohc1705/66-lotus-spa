using _66SMS.Contract.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Quản lý ví điện tử: lấy ví hiện có hoặc tạo mới nếu chưa có
    /// </summary>
    public class WalletManager
    {
        public static async Task<Wallet> GetOrCreateWalletAsync(
            int userId,
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            CancellationToken cancellationToken)
        {
            // Tải user kèm thông tin Customer và Staff để xử lý cả 2 loại tài khoản
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
                // Staff hoặc Admin chưa có Customer — tạo mới để có thể dùng ví
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

            // Tìm ví đã tồn tại theo CustomerId (chỉ tìm khi Customer đã được lưu vào DB, Id > 0)
            Wallet? wallet = null;
            if (customer.Id > 0)
            {
                wallet = await walletSqlRepository.AsQueryable()
                    .FirstOrDefaultAsync(w => w.CustomerId == customer.Id, cancellationToken);
            }

            if (wallet == null)
            {
                // Chưa có ví — tạo mới với số dư ban đầu là 0
                wallet = new Wallet
                {
                    Customer = customer,
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTimeHelper.UtcNow()
                };

                
                if (customer.Id > 0)
                {
                    wallet.CustomerId = customer.Id;
                }

                walletSqlRepository.Add(wallet);
            }

            return wallet;
        }
    }
}
