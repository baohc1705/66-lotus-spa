using _66SMS.Contract.Shared;

namespace _66SMS.Contract.Abstractions
{
    public interface IEmailTemplate
    {
        MailMessage Render();
    }
}
