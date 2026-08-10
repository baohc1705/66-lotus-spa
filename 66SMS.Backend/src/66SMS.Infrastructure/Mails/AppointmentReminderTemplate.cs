using _66SMS.Contract.Constants;
using _66SMS.Contract.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public sealed class AppointmentReminderTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string customerName;
        private readonly string serviceName;
        private readonly DateTime appointmentTime;
        private readonly string? cancelLink;

        public AppointmentReminderTemplate(string toEmail,string customerName, string serviceName, DateTime appointmentTime,string? cancelLink = null)
        {
            this.toEmail = toEmail;
            this.customerName = customerName;
            this.serviceName = serviceName;
            this.appointmentTime = appointmentTime;
            this.cancelLink = cancelLink;
        }

        public override MailMessage Render()
        {
            var cancelSection = cancelLink is not null
                ? BuildButton(cancelLink, "Hủy lịch hẹn", MailConst.Template.DangerColor)
                : string.Empty;

            var body = WrapLayout($"""
                <h2>Xin chào {customerName},</h2>
                <p>Đây là nhắc nhở về lịch hẹn sắp tới của bạn tại <strong>{MailConst.Template.AppName}</strong>.</p>
                <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;width:40%;">Dịch vụ</td>
                        <td style="padding:8px;border:1px solid #eee;">{serviceName}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;">Thời gian</td>
                        <td style="padding:8px;border:1px solid #eee;">{appointmentTime:HH:mm - dd/MM/yyyy}</td>
                    </tr>
                </table>
                {cancelSection}
                <p>Nếu bạn có thắc mắc, vui lòng liên hệ chúng tôi để được hỗ trợ.</p>
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.AppointmentReminder,
                HtmlBody = body,
            };
        }
    }
}
