using _66SMS.Contracts.Shared;

namespace _66SMS.Contracts.Abstractions
{
    public interface IEmailService
    {
        Task SendAsync(MailMessage message, CancellationToken cancellationToken = default);
    }
}
