using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public sealed class DepositInvoiceTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string customerName;
        private readonly string serviceName;
        private readonly DateTime appointmentTime;
        private readonly decimal depositAmount;
        private readonly decimal remainingAmount;
        private readonly string invoiceCode;

        public DepositInvoiceTemplate(
            string toEmail,
            string customerName,
            string serviceName,
            DateTime appointmentTime,
            decimal depositAmount,
            decimal remainingAmount,
            string invoiceCode)
        {
            this.toEmail = toEmail;
            this.customerName = customerName;
            this.serviceName = serviceName;
            this.appointmentTime = appointmentTime;
            this.depositAmount = depositAmount;
            this.remainingAmount = remainingAmount;
            this.invoiceCode = invoiceCode;
        }

        public override MailMessage Render()
        {
            var body = WrapLayout($"""
                <h2>Xin chào {customerName},</h2>
                <p>Cảm ơn bạn đã đặt cọc lịch hẹn tại <strong>{MailConst.Template.AppName}</strong>.</p>
                <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;width:40%;">Mã hóa đơn cọc</td>
                        <td style="padding:8px;border:1px solid #eee;">{invoiceCode}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;">Dịch vụ</td>
                        <td style="padding:8px;border:1px solid #eee;">{serviceName}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;">Thời gian hẹn</td>
                        <td style="padding:8px;border:1px solid #eee;">{appointmentTime:HH:mm - dd/MM/yyyy}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;">Số tiền đã cọc</td>
                        <td style="padding:8px;border:1px solid #eee;color:{MailConst.Template.PrimaryColor};font-weight:bold;">{depositAmount:N0} đ</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;">Số tiền còn lại</td>
                        <td style="padding:8px;border:1px solid #eee;">{remainingAmount:N0} đ</td>
                    </tr>
                </table>
                <p>Vui lòng đến đúng giờ. Lễ tân sẽ hỗ trợ check-in và sắp xếp vị trí phục vụ cho bạn.</p>
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.DepositInvoice,
                HtmlBody = body,
            };
        }
    }
}
