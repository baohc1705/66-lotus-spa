using _66SMS.Contract.Shared;

namespace _66SMS.Contract.Abstractions
{
    public interface IEmailService
    {
        Task SendAsync(MailMessage message, CancellationToken cancellationToken = default);
    }
}
