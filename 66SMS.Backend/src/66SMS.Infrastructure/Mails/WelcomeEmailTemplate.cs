using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public sealed class WelcomeEmailTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string userName;

        public WelcomeEmailTemplate(string toEmail, string userName)
        {
            this.toEmail = toEmail;
            this.userName = userName;
        }

        public override MailMessage Render()
        {
            var body = WrapLayout($"""
                <h2>Chào mừng {userName}!</h2>
                <p>Tài khoản của bạn tại <strong>{MailConst.Template.AppName}</strong> đã được xác nhận thành công.</p>
                <p>Bạn có thể đăng nhập và sử dụng đầy đủ các tính năng ngay bây giờ.</p>
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.WelcomeEmail,
                HtmlBody = body,
            };
        }
    }
}
