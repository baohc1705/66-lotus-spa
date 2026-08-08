using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Cộng tiền vào ví khi VNPay nạp thành công 
    /// </summary>
    public static class WalletTopUpApplyService
    {
        public static async Task<Result<object>> ApplyAsync(
            int walletId,
            decimal amount,
            string txnRef,
            IWalletSqlRepository walletRepository,
            IWalletTransactionSqlRepository transactionRepository,
            CancellationToken cancellationToken)
        {
            if (walletId <= 0 || amount <= 0 || string.IsNullOrWhiteSpace(txnRef))
            {
                return Result<object>.BadRequest(WalletConst.MSG_WALLET_INVALID_AMOUNT);
            }

            var noteMarker = $"TxnRef:{txnRef}";

            var alreadyExists = await transactionRepository.AsQueryable(asNoTracking: true)
                .AnyAsync(
                    t => t.WalletId == walletId
                         && t.Type == WalletTransactionConst.TYPE_TOP_UP
                         && t.Note != null
                         && t.Note.Contains(noteMarker),
                    cancellationToken);

            if (alreadyExists)
            {
                return Result<object>.Success(false, WalletConst.MSG_WALLET_TOP_UP_ALREADY);
            }

            var wallet = await walletRepository.AsQueryable(asNoTracking: false)
                .Include(w => w.Customer)
                .FirstOrDefaultAsync(w => w.Id == walletId, cancellationToken);

            if (wallet == null)
            {
                return Result<object>.NotFound(WalletConst.MSG_WALLET_NOT_FOUND);
            }

            if (wallet.Status != WalletConst.STATUS_ACTIVE)
            {
                return Result<object>.BadRequest(WalletConst.MSG_WALLET_NOT_ACTIVE);
            }

            wallet.Balance += amount;
            walletRepository.Update(wallet);

            var walletTx = new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = amount,
                BalanceAfter = wallet.Balance,
                Type = WalletTransactionConst.TYPE_TOP_UP,
                Note = $"Nạp tiền VNPay | {noteMarker}",
                Status = WalletTransactionConst.STATUS_SUCCESS,
                CreatedAt = DateTimeHelper.UtcNow(),
                CreatedBy = wallet.Customer?.UserId
            };

            transactionRepository.Add(walletTx);

            return Result<object>.Success(true, WalletConst.MSG_WALLET_TOP_UP_SUCCESS);
        }
    }
}
