namespace _66SMS.Contracts.Settings
{
    /// <summary>
    /// Config mapping cấu hình Cloudinary trong appsettings (section "CloudinarySettings").
    /// </summary>
    public class CloudinarySettings
    {
        /// <summary>Tên section trong file appsettings dùng để bind Options.</summary>
        public static string SectionName => "CloudinarySettings";

        /// <summary>Tên cloud (Cloud Name) của tài khoản Cloudinary.</summary>
        public string CloudName { get; set; } = string.Empty;

        /// <summary>API Key của Cloudinary.</summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>API Secret của Cloudinary (chỉ dùng phía server, không lộ ra client).</summary>
        public string ApiSecret { get; set; } = string.Empty;

        /// <summary>Thư mục gốc trên Cloudinary. Folder upload sẽ là {RootFolder}/{folder}.</summary>
        public string RootFolder { get; set; } = "66sms";

        /// <summary>Thư mục fallback khi client không truyền folder (dùng full path).</summary>
        public string CommonFolder { get;} = $"66sms/commons";

        /// <summary>Giới hạn dung lượng file tối đa (bytes). Mặc định 5MB.</summary>
        public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;

        /// <summary>Danh sách phần mở rộng (extension) ảnh được phép upload.</summary>
        public string[] AllowedExtensions { get; set; } = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    }
}
