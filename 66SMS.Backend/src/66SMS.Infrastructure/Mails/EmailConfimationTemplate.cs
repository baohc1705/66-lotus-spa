using _66SMS.Contract.Constants;
using _66SMS.Contract.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public class EmailConfimationTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string userName;
        private readonly string confirmationLink;
        public EmailConfimationTemplate(string toEmail, string userName, string confirmationLink)
        {
            this.toEmail = toEmail;
            this.userName = userName;
            this.confirmationLink = confirmationLink;
        }
        public override MailMessage Render()
        {
            var button = BuildButton(confirmationLink, "Xác nhận email", MailConst.Template.DangerColor);
            var expiryNote = BuildExpiryNote(MailConst.Expiry.PasswordResetTokenHours);
            var ignoreNote = BuildIgnoreNote("yêu cầu xác nhận email");

            var body = WrapLayout($"""
                <h2>Xin chào {userName},</h2>
                <p>Hãy xác mình email cho tài khoản của bạn tại <strong>{MailConst.Template.AppName}</strong>.</p>
                <p>Nhấn vào nút bên dưới để tiến hành:</p>
                {button}
                {expiryNote}
                {ignoreNote}
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.EmailConfirmation,
                HtmlBody = body,
            };
        }
    }
}
