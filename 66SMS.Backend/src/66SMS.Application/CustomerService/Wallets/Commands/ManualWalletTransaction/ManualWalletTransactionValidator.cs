using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CustomerService.Wallets.Commands.ManualWalletTransaction
{
    public class ManualWalletTransactionValidator : AbstractValidator<ManualWalletTransactionCommand>
    {
        public ManualWalletTransactionValidator()
        {
            RuleFor(x => x.WalletId).GreaterThan(0);
            RuleFor(x => x.Amount).NotEqual(0).WithMessage(WalletConst.MSG_WALLET_INVALID_AMOUNT);
            RuleFor(x => x.Note).NotEmpty().MaximumLength(500);
            RuleFor(x => x.UserId).GreaterThan(0);
        }
    }
}
