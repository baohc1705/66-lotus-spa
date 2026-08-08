using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;


namespace _66SMS.Infrastructure.Mails
{
    public class EmailTemplateFactory : IEmailTemplateFactory
    {
        public MailMessage CreatePasswordReset(string toEmail, string userName, string resetLink)
             => new PasswordResetTemplate(toEmail, userName, resetLink).Render();

        public MailMessage CreateEmailConfirmation(string toEmail, string userName, string confirmationLink)
            => new EmailConfimationTemplate(toEmail, userName, confirmationLink).Render();

        public MailMessage CreateWelcome(string toEmail, string userName)
            => new WelcomeEmailTemplate(toEmail, userName).Render();

        public MailMessage CreateAppointmentReminder(string toEmail,string customerName, string serviceName,DateTime appointmentTime,string? cancelLink = null)
            => new AppointmentReminderTemplate(toEmail, customerName, serviceName, appointmentTime, cancelLink).Render();

        public MailMessage CreateOtpEmail(string toEmail, string userName, string otpCode, int expiryMinutes)
            => new OtpEmailTemplate(toEmail, userName, otpCode, expiryMinutes).Render();

        public MailMessage CreateDepositInvoiceEmail(string toEmail, string customerName, string serviceName, DateTime appointmentTime, decimal depositAmount, decimal remainingAmount, string invoiceCode)
            => new DepositInvoiceTemplate(toEmail, customerName, serviceName, appointmentTime, depositAmount, remainingAmount, invoiceCode).Render();
    }
}
