using _66SMS.Contract.Constants;
using _66SMS.Contract.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public sealed class PasswordResetTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string userName;
        private readonly string resetLink;
        public PasswordResetTemplate(string toEmail, string userName, string resetLink)
        {
            this.toEmail = toEmail;
            this.userName = userName;
            this.resetLink = resetLink;
        }
        public override MailMessage Render()
        {
            var button = BuildButton(resetLink, "Đặt lại mật khẩu", MailConst.Template.DangerColor);
            var expiryNote = BuildExpiryNote(MailConst.Expiry.PasswordResetTokenHours);
            var ignoreNote = BuildIgnoreNote("yêu cầu đặt lại mật khẩu");

            var body = WrapLayout($"""
                <h2>Xin chào {userName},</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>{MailConst.Template.AppName}</strong>.</p>
                <p>Nhấn vào nút bên dưới để tiến hành:</p>
                {button}
                {expiryNote}
                {ignoreNote}
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.PasswordReset,
                HtmlBody = body,
            };
        }
    }
}
