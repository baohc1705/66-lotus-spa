using _66SMS.Contracts.Shared;

namespace _66SMS.Contracts.Abstractions
{
    public interface IEmailTemplate
    {
        MailMessage Render();
    }
}
