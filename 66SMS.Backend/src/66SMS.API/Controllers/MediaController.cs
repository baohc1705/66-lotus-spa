using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Media.Commands.UploadImage;
using _66SMS.Application.Features.Media.Commands.UploadImages;
using _66SMS.Contracts.Shared;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    [Authorize]
    public class MediaController : ApiController<MediaController>
    {
        private readonly IMediator mediator;

        public MediaController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        /// <summary>Upload một ảnh lên Cloudinary, trả về URL.</summary>
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string? folder)
        {
            if (file == null || file.Length == 0)
                return HandleResult(Result<string>.BadRequest("Vui lòng chọn file ảnh."));

            await using var stream = file.OpenReadStream();
            var result = await mediator.Send(new UploadImageCommand
            {
                Content = stream,
                FileName = file.FileName,
                ContentType = file.ContentType,
                Folder = folder
            });

            return HandleResult(result);
        }

        /// <summary>Upload nhiều ảnh lên Cloudinary, trả về danh sách URL.</summary>
        [HttpPost("images")]
        public async Task<IActionResult> UploadImages(List<IFormFile> files, [FromQuery] string? folder)
        {
            if (files == null || files.Count == 0)
                return HandleResult(Result<List<string>>.BadRequest("Vui lòng chọn ít nhất một file ảnh."));

            var items = new List<UploadImageItem>();
            var streams = new List<Stream>();

            try
            {
                foreach (var file in files)
                {
                    var stream = file.OpenReadStream();
                    streams.Add(stream);
                    items.Add(new UploadImageItem
                    {
                        Content = stream,
                        FileName = file.FileName,
                        ContentType = file.ContentType
                    });
                }

                var result = await mediator.Send(new UploadImagesCommand { Items = items, Folder = folder });
                return HandleResult(result);
            }
            finally
            {
                foreach (var s in streams)
                    await s.DisposeAsync();
            }
        }
    }
}
