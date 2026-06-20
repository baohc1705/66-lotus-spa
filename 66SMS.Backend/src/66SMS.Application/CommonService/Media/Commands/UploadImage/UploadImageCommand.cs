using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Media.Commands.UploadImage
{
    public class UploadImageCommand : IRequest<Result<string>>
    {
        public Stream Content { get; set; } = Stream.Null;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string? Folder { get; set; }
    }
}
