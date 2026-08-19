using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Messages;
using _66SMS.Contract.Shared;
using Ganss.Xss;
using MediatR;

namespace _66SMS.Application.NotificationService.Emails.Commands.SendManualEmail
{
    public class SendManualEmailHandler : IRequestHandler<SendManualEmailCommand, Result<object>>
    {
        private static readonly HtmlSanitizer htmlSanitizer = new();
        private readonly IDomainEventPublisher domainEventPublisher;

        public SendManualEmailHandler(IDomainEventPublisher domainEventPublisher)
        {
            this.domainEventPublisher = domainEventPublisher;
        }

        public async Task<Result<object>> Handle(SendManualEmailCommand request, CancellationToken cancellationToken)
        {
            var sanitizedHtmlBody = htmlSanitizer.Sanitize(request.HtmlBody);
            if (string.IsNullOrWhiteSpace(sanitizedHtmlBody))
                return Result<object>.BadRequest("Nội dung email không hợp lệ.");

            await domainEventPublisher.PublishAsync(new SendEmailEvent
            {
                ToEmail = request.ToEmail.Trim(),
                Subject = request.Subject.Trim(),
                HtmlBody = sanitizedHtmlBody,
            }, cancellationToken);

            return Result<object>.Success(null!, "Gửi email thành công, hệ thống đang xử lý.");
        }
    }
}
