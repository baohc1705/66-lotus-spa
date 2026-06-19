using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Media.Commands.UploadImage
{
    public class UploadImageHandler : IRequestHandler<UploadImageCommand, Result<string>>
    {
        private readonly IFileStorageService fileStorageService;

        public UploadImageHandler(IFileStorageService fileStorageService)
        {
            this.fileStorageService = fileStorageService;
        }

        public async Task<Result<string>> Handle(UploadImageCommand request, CancellationToken cancellationToken)
        {
            var uploadResult = await fileStorageService.UploadImageAsync(new FileUploadRequest
            {
                Content = request.Content,
                FileName = request.FileName,
                ContentType = request.ContentType,
                Folder = request.Folder
            }, cancellationToken);

            if (!uploadResult.Success)
                return Result<string>.BadRequest(uploadResult.Error ?? "Upload ảnh thất bại.");

            // EXTENSION POINT: sau khi upload thành công, publish event ImageUploaded
            // qua MassTransit/RabbitMQ để xử lý hậu kỳ (resize, watermark, dọn ảnh mồ côi v.v.)
            // PublicId = uploadResult.PublicId — dùng cho Quartz job dọn ảnh mồ côi sau này

            return Result<string>.Success(uploadResult.Url);
        }
    }
}
