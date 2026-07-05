using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Media.Commands.UploadImage
{
    /// <summary>
    /// Command to upload an image to the media storage
    /// </summary>
    public class UploadImageCommand : IRequest<Result<string>>
    {
        /// <summary>
        /// The content of the image to upload  
        /// </summary>
        public Stream Content { get; set; } = Stream.Null;
        /// <summary>
        /// The name of the file to upload
        /// </summary>
        public string FileName { get; set; } = string.Empty;
        /// <summary>
        /// The content type of the image to upload
        /// </summary>
        public string ContentType { get; set; } = string.Empty;
        /// <summary>
        /// The folder to upload the image to
        /// </summary>
        public string? Folder { get; set; }
    }
}
