using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public sealed class OtpEmailTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string userName;
        private readonly string otpCode;
        private readonly int expiryMinutes;

        public OtpEmailTemplate(string toEmail, string userName, string otpCode, int expiryMinutes)
        {
            this.toEmail = toEmail;
            this.userName = userName;
            this.otpCode = otpCode;
            this.expiryMinutes = expiryMinutes;
        }

        public override MailMessage Render()
        {
            var ignoreNote = BuildIgnoreNote("yêu cầu xác minh email");

            var body = WrapLayout($"""
                <h2>Xin chào {userName},</h2>
                <p>Đây là mã OTP để xác minh địa chỉ email của bạn tại <strong>{MailConst.Template.AppName}</strong>.</p>
                <p>Mã OTP của bạn là:</p>
                <div style="text-align:center;margin:24px 0;">
                    <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:{MailConst.Template.PrimaryColor};
                                 background:#f3f4ff;padding:16px 32px;border-radius:8px;display:inline-block;">
                        {otpCode}
                    </span>
                </div>
                <p style="color:#ef4444;">Mã OTP sẽ hết hạn sau <strong>{expiryMinutes} phút</strong>.</p>
                {ignoreNote}
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.OtpEmail,
                HtmlBody = body,
            };
        }
    }
}
