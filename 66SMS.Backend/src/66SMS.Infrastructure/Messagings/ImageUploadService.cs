using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Messages;
using _66SMS.Contracts.Helpers;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Messagings
{
    /// <summary>
    /// Implement <see cref="IImageUploadService"/> bằng MassTransit request/response.
    /// Kiểm tra magic bytes → gắn extension thật vào FileName trước khi publish.
    /// </summary>
    public class ImageUploadService : IImageUploadService
    {
        private readonly IRequestClient<UploadImageEvent> requestClient;
        private readonly ILogger<ImageUploadService> logger;

        public ImageUploadService(
            IRequestClient<UploadImageEvent> requestClient,
            ILogger<ImageUploadService> logger)
        {
            this.requestClient = requestClient;
            this.logger = logger;
        }

        public async Task<string?> UploadAsync(
            string imageBase64,
            string fileName,
            string folder,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(imageBase64))
                return null;

            if (!ImageContentHelper.TryDecodeAndDetect(
                    imageBase64,
                    out _,
                    out var extension,
                    out var contentType))
            {
                logger.LogWarning(
                    "Rejected image upload for base name {FileName}: invalid or unsupported image bytes.",
                    fileName);
                return null;
            }

            // Bỏ extension cũ — chỉ tin extension phát hiện từ nội dung
            var baseName = Path.GetFileNameWithoutExtension(fileName);
            if (string.IsNullOrWhiteSpace(baseName))
                baseName = "image";

            var safeFileName = baseName + extension;

            try
            {
                var response = await requestClient.GetResponse<UploadImageResult>(
                    new UploadImageEvent
                    {
                        ImageBase64 = imageBase64,
                        FileName = safeFileName,
                        Folder = folder,
                        ContentType = contentType,
                    },
                    cancellationToken);

                if (response.Message.Success && !string.IsNullOrWhiteSpace(response.Message.Url))
                    return response.Message.Url;

                logger.LogWarning(
                    "Image upload failed for {FileName}: {Error}",
                    safeFileName,
                    response.Message.Error);
                return null;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Image upload request failed for {FileName}", safeFileName);
                return null;
            }
        }
    }
}
