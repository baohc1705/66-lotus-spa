using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace _66SMS.Infrastructure.Storage.Cloudinary
{
    /// <summary>
    /// Triển khai <see cref="IFileStorageService"/> bằng Cloudinary.
    /// Đảm nhận validate file (định dạng/dung lượng) và upload ảnh, trả về secure_url.
    /// </summary>
    public class CloudinaryFileStorageService : IFileStorageService
    {
        private readonly CloudinarySettings settings;
        private readonly CloudinaryDotNet.Cloudinary cloudinary;

        /// <summary>
        /// Khởi tạo client Cloudinary từ cấu hình Options.
        /// </summary>
        public CloudinaryFileStorageService(IOptions<CloudinarySettings> options)
        {
            this.settings = options.Value;
            var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
            this.cloudinary = new CloudinaryDotNet.Cloudinary(account);
        }

        /// <summary>
        /// Upload ảnh lên Cloudinary sau khi kiểm tra định dạng và dung lượng.
        /// </summary>
        public async Task<FileUploadResult> UploadImageAsync(FileUploadRequest request, CancellationToken cancellationToken = default)
        {
            // 1. Kiểm tra định dạng (extension) có nằm trong danh sách cho phép không
            var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !settings.AllowedExtensions.Contains(extension))
            {
                return new FileUploadResult
                {
                    Success = false,
                    Error = $"Định dạng file không hợp lệ. Chỉ chấp nhận: {string.Join(", ", settings.AllowedExtensions)}"
                };
            }

            // 2. Kiểm tra dung lượng (nếu stream hỗ trợ đọc Length)
            if (request.Content.CanSeek && request.Content.Length > settings.MaxFileSizeBytes)
            {
                var maxMb = settings.MaxFileSizeBytes / (1024d * 1024d);
                return new FileUploadResult
                {
                    Success = false,
                    Error = $"Dung lượng file vượt quá giới hạn {maxMb:0.#}MB."
                };
            }

            // 3. Chuẩn bị tham số upload và gửi lên Cloudinary
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(request.FileName, request.Content),
                Folder = string.IsNullOrWhiteSpace(request.Folder)
                    ? settings.CommonFolder
                    : $"{settings.RootFolder}/{request.Folder}",
                UseFilename = true,
                UniqueFilename = false,
                Overwrite = false
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams, cancellationToken);

            if (uploadResult.Error != null)
            {
                return new FileUploadResult { Success = false, Error = uploadResult.Error.Message };
            }

            return new FileUploadResult
            {
                Success = true,
                Url = uploadResult.SecureUrl?.ToString() ?? string.Empty,
                PublicId = uploadResult.PublicId
            };
        }

        /// <summary>
        /// Xóa file theo public id (dùng cho mở rộng sau này).
        /// </summary>
        public async Task<bool> DeleteAsync(string publicId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(publicId))
                return false;

            var deletionParams = new DeletionParams(publicId);
            var result = await cloudinary.DestroyAsync(deletionParams);
            return result.Result == "ok";
        }
    }
}
