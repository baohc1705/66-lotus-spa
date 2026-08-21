using _66SMS.Contract.Constants;
using FluentValidation;

namespace _66SMS.Application.NotificationService.Emails.Commands.SendManualEmail
{
    public class SendManualEmailValidator : AbstractValidator<SendManualEmailCommand>
    {
        public SendManualEmailValidator()
        {
            RuleFor(x => x.ToEmail)
                .NotEmpty().WithMessage("Email người nhận không được để trống.")
                .Matches(RegexConst.EMAIL_REGEX).WithMessage("Email người nhận không hợp lệ.");

            RuleFor(x => x.Subject)
                .NotEmpty().WithMessage("Tiêu đề không được để trống.")
                .MaximumLength(200);

            RuleFor(x => x.HtmlBody)
                .NotEmpty().WithMessage("Nội dung email không được để trống.")
                .MaximumLength(20000);
        }
    }
}
