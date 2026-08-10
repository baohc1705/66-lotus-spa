namespace _66SMS.Contract.Abstractions
{
    /// <summary>
    /// Service lưu trữ file dùng chung. Đặt tên tổng quát (không gắn Cloudinary) để dễ
    /// thay thế nhà cung cấp khác (S3, Azure Blob...) mà không phải sửa tầng Application.
    /// Implement cụ thể nằm ở tầng Infrastructure.
    /// </summary>
    public interface IFileStorageService
    {
        /// <summary>
        /// Upload một ảnh lên nhà cung cấp lưu trữ và trả về URL truy cập.
        /// </summary>
        /// <param name="request">Thông tin file cần upload (stream nội dung + metadata).</param>
        /// <param name="cancellationToken">Token hủy thao tác.</param>
        /// <returns>Kết quả upload gồm trạng thái, URL và public id.</returns>
        Task<FileUploadResult> UploadImageAsync(FileUploadRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Xóa một file đã upload theo public id (dùng cho mở rộng sau này).
        /// </summary>
        /// <param name="publicId">Định danh file trên nhà cung cấp.</param>
        /// <param name="cancellationToken">Token hủy thao tác.</param>
        /// <returns>True nếu xóa thành công.</returns>
        Task<bool> DeleteAsync(string publicId, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Dữ liệu đầu vào để upload file. Dùng <see cref="Stream"/> thay vì IFormFile
    /// để tầng Contract/Application không phụ thuộc vào ASP.NET.
    /// </summary>
    public class FileUploadRequest
    {
        /// <summary>Nội dung file (stream).</summary>
        public Stream Content { get; set; } = Stream.Null;

        /// <summary>Tên file gốc (dùng để lấy extension và đặt tên).</summary>
        public string FileName { get; set; } = string.Empty;

        /// <summary>Kiểu nội dung (content-type), ví dụ "image/png".</summary>
        public string ContentType { get; set; } = string.Empty;

        /// <summary>Thư mục đích trên nhà cung cấp (nếu để trống dùng mặc định trong Options).</summary>
        public string? Folder { get; set; }
    }

    /// <summary>
    /// Kết quả trả về sau khi upload file.
    /// </summary>
    public class FileUploadResult
    {
        /// <summary>Upload thành công hay không.</summary>
        public bool Success { get; set; }

        /// <summary>URL truy cập file (secure_url) khi thành công.</summary>
        public string Url { get; set; } = string.Empty;

        /// <summary>Public id của file trên nhà cung cấp (dùng để xóa/cập nhật sau này).</summary>
        public string PublicId { get; set; } = string.Empty;

        /// <summary>Thông báo lỗi khi upload thất bại.</summary>
        public string? Error { get; set; }
    }
}
