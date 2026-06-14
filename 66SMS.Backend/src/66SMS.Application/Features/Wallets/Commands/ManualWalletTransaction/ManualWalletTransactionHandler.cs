using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Wallets.Commands.ManualWalletTransaction
{
    public class ManualWalletTransactionHandler : IRequestHandler<ManualWalletTransactionCommand, Result<object>>
    {
        private readonly IWalletSqlRepository walletRepository;
        private readonly IWalletTransactionSqlRepository transactionRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public ManualWalletTransactionHandler(
            IWalletSqlRepository walletRepository, 
            IWalletTransactionSqlRepository transactionRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.walletRepository = walletRepository;
            this.transactionRepository = transactionRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(ManualWalletTransactionCommand request, CancellationToken cancellationToken)
        {
            if (request.Amount == 0)
            {
                return Result<object>.BadRequest("Số tiền phải khác 0.");
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var wallet = await walletRepository.AsQueryable(asNoTracking: false)
                    .FirstOrDefaultAsync(w => w.Id == request.WalletId, cancellationToken);

                if (wallet == null)
                {
                    return Result<object>.NotFound("Ví không tồn tại.");
                }

                if (wallet.Balance + request.Amount < 0)
                {
                    return Result<object>.BadRequest($"Số dư ví không đủ để trừ. (Hiện có: {wallet.Balance:N0}đ)");
                }

                wallet.Balance += request.Amount;
                walletRepository.Update(wallet);

                var walletTx = new WalletTransaction
                {
                    WalletId = wallet.Id,
                    Amount = request.Amount,
                    BalanceAfter = wallet.Balance,
                    Type = request.Amount > 0 ? WalletTransactionConst.TYPE_TOP_UP : WalletTransactionConst.TYPE_ADMIN_ADJUST,
                    Note = string.IsNullOrWhiteSpace(request.Note) 
                        ? (request.Amount > 0 ? "Nạp tiền thủ công" : "Trừ tiền thủ công") 
                        : request.Note.Trim(),
                    Status = WalletTransactionConst.STATUS_SUCCESS,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = request.UserId
                };

                transactionRepository.Add(walletTx);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Success("Giao dịch thành công.");
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
