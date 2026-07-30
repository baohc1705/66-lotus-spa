namespace _66SMS.Contracts.Messages
{
    /// <summary>
    /// Request upload ảnh lên Cloudinary (MassTransit request/response).
    /// Consumer chỉ upload và trả <see cref="UploadImageResult"/> — không cập nhật entity.
    /// </summary>
    public class UploadImageEvent : DomainEvent
    {
        public string ImageBase64 { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string Folder { get; set; } = "commons";
        public string ContentType { get; set; } = "image/jpeg";
    }

    /// <summary>
    /// Kết quả upload ảnh từ UploadImageConsumer.
    /// </summary>
    public class UploadImageResult
    {
        public bool Success { get; set; }
        public string? Url { get; set; }
        public string? Error { get; set; }
    }
}
