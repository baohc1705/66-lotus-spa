using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Media.Commands.UploadImages
{
    public class UploadImagesHandler : IRequestHandler<UploadImagesCommand, Result<List<string>>>
    {
        private readonly IFileStorageService fileStorageService;

        public UploadImagesHandler(IFileStorageService fileStorageService)
        {
            this.fileStorageService = fileStorageService;
        }

        public async Task<Result<List<string>>> Handle(UploadImagesCommand request, CancellationToken cancellationToken)
        {
            var urls = new List<string>();

            foreach (var item in request.Items)
            {
                var uploadResult = await fileStorageService.UploadImageAsync(new FileUploadRequest
                {
                    Content = item.Content,
                    FileName = item.FileName,
                    ContentType = item.ContentType,
                    Folder = request.Folder
                }, cancellationToken);

                if (!uploadResult.Success)
                    return Result<List<string>>.BadRequest(uploadResult.Error ?? $"Upload ảnh '{item.FileName}' thất bại.");

                urls.Add(uploadResult.Url);
            }

            return Result<List<string>>.Success(urls);
        }
    }
}
