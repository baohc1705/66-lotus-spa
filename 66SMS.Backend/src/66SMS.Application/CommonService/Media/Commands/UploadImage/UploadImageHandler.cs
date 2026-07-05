using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Media.Commands.UploadImage
{
    /// <summary>
    /// Handler to upload an image to the media storage
    /// </summary>
    public class UploadImageHandler : IRequestHandler<UploadImageCommand, Result<string>>
    {
        private readonly IFileStorageService fileStorageService;

        public UploadImageHandler(IFileStorageService fileStorageService)
        {
            this.fileStorageService = fileStorageService;
        }

        public async Task<Result<string>> Handle(UploadImageCommand request, CancellationToken cancellationToken)
        {
            // Create request to upload image
            var uploadResult = await fileStorageService.UploadImageAsync(new FileUploadRequest
            {
                Content = request.Content,
                FileName = request.FileName,
                ContentType = request.ContentType,
                Folder = request.Folder
            }, cancellationToken);

            // Check upload result
            if (!uploadResult.Success)
                return Result<string>.BadRequest(uploadResult.Error ?? "Upload ảnh thất bại.");

            // Return the URL of the uploaded image
            return Result<string>.Success(uploadResult.Url);
        }
    }
}
