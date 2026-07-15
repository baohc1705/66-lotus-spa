using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Quản lý ví điện tử: lấy ví hiện có hoặc tạo mới nếu chưa có
    /// </summary>
    public class WalletManager
    {
        // Lấy ví của user, tự tạo Customer và Wallet nếu chưa tồn tại
        // Lưu ý: sau khi gọi method này phải gọi SaveChangesAsync() bên ngoài để lưu vào DB
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
                    FullName = user.Staff?.FullName ?? user.Username ?? "User",
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

                // Gán CustomerId trực tiếp nếu Customer đã có Id (tránh trùng khi EF track navigation)
                if (customer.Id > 0)
                {
                    wallet.CustomerId = customer.Id;
                }

                walletSqlRepository.Add(wallet);
                // Chưa SaveChanges ở đây — caller phải tự gọi unit of work để lưu cùng 1 transaction
            }

            return wallet;
        }
    }
}
