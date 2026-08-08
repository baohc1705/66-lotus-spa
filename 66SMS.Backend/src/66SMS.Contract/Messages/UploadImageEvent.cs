namespace _66SMS.Contract.Messages
{
    public class UploadImageEvent : DomainEvent
    {
        public string ImageBase64 { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string Folder { get; set; } = "commons";
        public string ContentType { get; set; } = "image/jpeg";
    }

    public class UploadImageResult
    {
        public bool Success { get; set; }
        public string? Url { get; set; }
        public string? Error { get; set; }
    }
}
