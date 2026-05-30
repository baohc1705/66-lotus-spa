using _66SMS.Contracts.Shared;

namespace _66SMS.Contracts.Abstractions
{
    public interface IEmailTemplateFactory
    {
        MailMessage CreatePasswordReset(string toEmail, string userName, string resetLink);
        MailMessage CreateEmailConfirmation(string toEmail, string userName, string confirmationLink);
        MailMessage CreateWelcome(string toEmail, string userName);
        MailMessage CreateAppointmentReminder(string toEmail, string customerName, string serviceName, DateTime appointmentTime, string? cancelLink = null);
    }
}
