using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Messages;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Consumers
{
    /// <summary>
    /// Consumer upload ảnh lên Cloudinary và Respond URL — không cập nhật entity.
    /// </summary>
    public class UploadImageConsumer : IConsumer<UploadImageEvent>
    {
        private readonly IFileStorageService fileStorageService;
        private readonly ILogger<UploadImageConsumer> logger;

        public UploadImageConsumer(
            IFileStorageService fileStorageService,
            ILogger<UploadImageConsumer> logger)
        {
            this.fileStorageService = fileStorageService;
            this.logger = logger;
        }

        public async Task Consume(ConsumeContext<UploadImageEvent> context)
        {
            var message = context.Message;
            logger.LogInformation("Uploading image {FileName} to folder {Folder}", message.FileName, message.Folder);

            if (!ImageContentHelper.TryDecodeAndDetect(
                    message.ImageBase64,
                    out var bytes,
                    out var detectedExtension,
                    out var contentType))
            {
                logger.LogError("Invalid or unsupported image bytes for {FileName}", message.FileName);
                await context.RespondAsync(new UploadImageResult
                {
                    Success = false,
                    Error = "Invalid or unsupported image content. Only jpg, png, webp are allowed.",
                });
                return;
            }

            if (!ImageContentHelper.MatchesDeclaredExtension(bytes, message.FileName))
            {
                logger.LogError(
                    "FileName extension mismatch for {FileName}. Detected: {Detected}",
                    message.FileName,
                    detectedExtension);
                await context.RespondAsync(new UploadImageResult
                {
                    Success = false,
                    Error = "File name extension does not match image content.",
                });
                return;
            }

            await using var stream = new MemoryStream(bytes);
            var uploadResult = await fileStorageService.UploadImageAsync(new FileUploadRequest
            {
                Content = stream,
                FileName = message.FileName,
                ContentType = string.IsNullOrWhiteSpace(message.ContentType) ? contentType : message.ContentType,
                Folder = message.Folder,
            }, context.CancellationToken);

            if (!uploadResult.Success || string.IsNullOrWhiteSpace(uploadResult.Url))
            {
                logger.LogError("Cloudinary upload failed for {FileName}: {Error}", message.FileName, uploadResult.Error);
                await context.RespondAsync(new UploadImageResult
                {
                    Success = false,
                    Error = uploadResult.Error ?? "Upload failed.",
                });
                return;
            }

            await context.RespondAsync(new UploadImageResult
            {
                Success = true,
                Url = uploadResult.Url,
            });
        }
    }
}
