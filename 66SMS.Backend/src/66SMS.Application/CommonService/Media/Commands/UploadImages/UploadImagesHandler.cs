using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Media.Commands.UploadImages
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
            // Create list to store the URLs of the uploaded images
            var urls = new List<string>();

            // Upload each image
            foreach (var item in request.Items)
            {
                // Upload image
                var uploadResult = await fileStorageService.UploadImageAsync(new FileUploadRequest
                {
                    Content = item.Content,
                    FileName = item.FileName,
                    ContentType = item.ContentType,
                    Folder = request.Folder
                }, cancellationToken);

                // Check upload result
                if (!uploadResult.Success)
                    return Result<List<string>>.BadRequest(uploadResult.Error ?? $"Upload image '{item.FileName}' failed.");

                // Add the URL of the uploaded image to the list
                urls.Add(uploadResult.Url);
            }

            // Return the URLs of the uploaded images
            return Result<List<string>>.Success(urls);
        }
    }
}
