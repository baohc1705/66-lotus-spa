using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Media.Commands.UploadImages
{
    /// <summary>
    /// Item to upload an image to the media storage
    /// </summary>
    public class UploadImageItem
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
    }

    /// <summary>
    /// Command to upload multiple images to the media storage
    /// </summary>
    public class UploadImagesCommand : IRequest<Result<List<string>>>
    {
        /// <summary>
        /// The items to upload
        /// </summary>
        public List<UploadImageItem> Items { get; set; } = new();
        /// <summary>
        /// The folder to upload the images to
        /// </summary>
        public string? Folder { get; set; }
    }
}
