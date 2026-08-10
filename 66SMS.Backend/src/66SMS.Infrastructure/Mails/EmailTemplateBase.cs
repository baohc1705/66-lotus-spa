using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public abstract class EmailTemplateBase : IEmailTemplate
    {
        public abstract MailMessage Render();
        protected static string WrapLayout(string innerHtml)
        {
            return $"""
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8"/>
                    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
                </head>
                <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
                    {innerHtml}
                    <hr style="margin-top:32px;border:none;border-top:1px solid #eee;"/>
                    <p style="color:{MailConst.Template.FooterTextColor};font-size:{MailConst.Template.FooterFontSize};margin-top:8px;">
                        &copy; {DateTimeHelper.UtcNow().Year} {MailConst.Template.AppName}. All rights reserved.
                    </p>
                </body>
                </html>
                """;
        }

        protected static string BuildButton(string url, string label, string backgroundColor)
        {
            return $"""
                <p style="margin:24px 0;">
                    <a href="{url}"
                       style="background:{backgroundColor};
                              color:{MailConst.Template.ButtonTextColor};
                              padding:{MailConst.Template.ButtonPadding};
                              border-radius:{MailConst.Template.ButtonBorderRadius};
                              text-decoration:none;
                              display:inline-block;
                              font-weight:bold;">
                        {label}
                    </a>
                </p>
                """;
        }

        protected static string BuildExpiryNote(int hours)
        {
            return $"<p>Liên kết sẽ hết hạn sau <strong>{hours} giờ</strong>.</p>";
        }

        protected static string BuildIgnoreNote(string actionDescription)
        {
            return $"""
                <p style="color:{MailConst.Template.FooterTextColor};font-size:{MailConst.Template.FooterFontSize};">
                    Nếu bạn không {actionDescription}, hãy bỏ qua email này.
                </p>
                """;
        }
    }
}
