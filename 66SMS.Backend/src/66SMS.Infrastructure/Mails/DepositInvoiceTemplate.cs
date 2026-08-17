using System.Net;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Shared;

namespace _66SMS.Infrastructure.Mails
{
    public sealed class DepositInvoiceTemplate : EmailTemplateBase
    {
        private readonly string toEmail;
        private readonly string? customerName;
        private readonly DateTime appointmentTime;
        private readonly decimal depositAmount;
        private readonly decimal remainingAmount;
        private readonly string invoiceCode;
        private readonly IReadOnlyList<MailAppointmentServiceLine> services;

        public DepositInvoiceTemplate(
            string toEmail,
            string? customerName,
            DateTime appointmentTime,
            decimal depositAmount,
            decimal remainingAmount,
            string invoiceCode,
            IReadOnlyList<MailAppointmentServiceLine> services)
        {
            this.toEmail = toEmail;
            this.customerName = customerName;
            this.appointmentTime = appointmentTime;
            this.depositAmount = depositAmount;
            this.remainingAmount = remainingAmount;
            this.invoiceCode = invoiceCode;
            this.services = services ?? Array.Empty<MailAppointmentServiceLine>();
        }

        public override MailMessage Render()
        {
            var body = WrapLayout($"""
                <h2>Xin chào {WebUtility.HtmlEncode(customerName)},</h2>
                <p>Cảm ơn bạn đã đặt cọc lịch hẹn tại <strong>{MailConst.Template.AppName}</strong>.</p>
                <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;width:40%;">Mã hóa đơn cọc</td>
                        <td style="padding:8px;border:1px solid #eee;">{WebUtility.HtmlEncode(invoiceCode)}</td>
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
                {RenderServicesTable()}
                <p>Vui lòng đến đúng giờ. Lễ tân sẽ hỗ trợ check-in và sắp xếp vị trí phục vụ cho bạn.</p>
                """);

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = MailConst.Subject.DepositInvoice,
                HtmlBody = body,
            };
        }

        private string RenderServicesTable()
        {
            if (services.Count == 0)
                return "";

            var rows = "";
            var cursor = appointmentTime;
            var totalMins = 0;
            decimal totalPrice = 0;
            for (var index = 0; index < services.Count; index++)
            {
                var line = services[index];
                var duration = line.DurationMins;
                var start = cursor;
                cursor = cursor.AddMinutes(duration);
                totalMins += duration;
                totalPrice += line.Price;
                var name = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(line.Name) ? "Dịch vụ" : line.Name);
                rows += $"""
                    <tr>
                        <td style="padding:8px;border:1px solid #eee;">{name}</td>
                        <td style="padding:8px;border:1px solid #eee;white-space:nowrap;">{start:HH:mm} - {cursor:HH:mm}</td>
                        <td style="padding:8px;border:1px solid #eee;white-space:nowrap;">{duration} phút</td>
                        <td style="padding:8px;border:1px solid #eee;white-space:nowrap;text-align:right;">{line.Price:N0} đ</td>
                    </tr>
                    """;
            }

            return $"""
                <p style="font-weight:bold;margin:16px 0 8px;">Dịch vụ</p>
                <table style="border-collapse:collapse;width:100%;margin:0 0 16px;">
                    <tr>
                        <th style="padding:8px;border:1px solid #eee;text-align:left;">Tên dịch vụ</th>
                        <th style="padding:8px;border:1px solid #eee;text-align:left;">Thời gian (bắt đầu - kết thúc)</th>
                        <th style="padding:8px;border:1px solid #eee;text-align:left;">Số thời gian phục vụ</th>
                        <th style="padding:8px;border:1px solid #eee;text-align:right;">Tiền dịch vụ</th>
                    </tr>
                    {rows}
                    <tr>
                        <td colspan="2" style="padding:8px;border:1px solid #eee;font-weight:bold;">Tổng</td>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;white-space:nowrap;">{totalMins} phút</td>
                        <td style="padding:8px;border:1px solid #eee;font-weight:bold;white-space:nowrap;text-align:right;">{totalPrice:N0} đ</td>
                    </tr>
                </table>
                """;
        }
    }
}
