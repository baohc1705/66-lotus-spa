using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetWalletTopUpVnPayUrl
{
    public class GetWalletTopUpVnPayUrlHandler : IRequestHandler<GetWalletTopUpVnPayUrlQuery, Result<string>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IWalletSqlRepository walletSqlRepository;
        private readonly IVnPayService vnPayService;
        private readonly ISqlUnitOfWork unitOfWork;

        public GetWalletTopUpVnPayUrlHandler(
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            IVnPayService vnPayService,
            ISqlUnitOfWork unitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.walletSqlRepository = walletSqlRepository;
            this.vnPayService = vnPayService;
            this.unitOfWork = unitOfWork;
        }

        public async Task<Result<string>> Handle(GetWalletTopUpVnPayUrlQuery request, CancellationToken cancellationToken)
        {
            if (request.Amount < WalletConst.TOP_UP_MIN_AMOUNT
                || request.Amount > WalletConst.TOP_UP_MAX_AMOUNT
                || request.Amount != Math.Floor(request.Amount))
            {
                return Result<string>.BadRequest(
                    WalletConst.MSG_WALLET_TOP_UP_AMOUNT_RANGE,
                    ErrorCodes.ERR_WALLET_INVALID_AMOUNT);
            }

            var wallet = await WalletManager.GetOrCreateWalletAsync(
                request.UserId,
                userSqlRepository,
                walletSqlRepository,
                cancellationToken);

            await unitOfWork.SaveChangeAsync(cancellationToken);

            if (wallet.Status != WalletConst.STATUS_ACTIVE)
            {
                return Result<string>.BadRequest(
                    WalletConst.MSG_WALLET_NOT_ACTIVE,
                    ErrorCodes.ERR_WALLET_INVALID);
            }

            var ip = string.IsNullOrWhiteSpace(request.IpAddress) ? "127.0.0.1" : request.IpAddress;
            var url = vnPayService.CreateWalletTopUpUrl(
                wallet.Id,
                request.Amount,
                $"Nap tien vi {wallet.Id}",
                ip);

            return Result<string>.Success(url);
        }
    }
}
