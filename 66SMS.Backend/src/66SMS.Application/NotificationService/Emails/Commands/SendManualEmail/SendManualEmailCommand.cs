using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.NotificationService.Emails.Commands.SendManualEmail
{
    public class SendManualEmailCommand : IRequest<Result<object>>
    {
        public string ToEmail { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string HtmlBody { get; set; } = null!;
    }
}
