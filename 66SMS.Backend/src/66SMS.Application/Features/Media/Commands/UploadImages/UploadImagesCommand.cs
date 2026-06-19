using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Media.Commands.UploadImages
{
    public class UploadImageItem
    {
        public Stream Content { get; set; } = Stream.Null;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
    }

    public class UploadImagesCommand : IRequest<Result<List<string>>>
    {
        public List<UploadImageItem> Items { get; set; } = new();
        public string? Folder { get; set; }
    }
}
