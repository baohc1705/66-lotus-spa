namespace _66SMS.Contracts.Abstractions
{
    /// <summary>
    /// Upload ảnh qua message bus 
    /// Handler chỉ nhận URL, không phụ thuộc MassTransit/IRequestClient.
    /// </summary>
    public interface IImageUploadService
    {
        /// <summary>
        /// Gửi ảnh base64 lên queue, chờ consumer upload và trả về URL.
        /// </summary>
        /// <returns>URL ảnh khi thành công; null khi thất bại.</returns>
        Task<string?> UploadAsync(
            string imageBase64,
            string fileName,
            string folder,
            CancellationToken cancellationToken = default);
    }
}
