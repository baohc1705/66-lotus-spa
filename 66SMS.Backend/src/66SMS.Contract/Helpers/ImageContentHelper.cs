namespace _66SMS.Contract.Helpers
{
    /// <summary>
    /// Phát hiện và kiểm tra loại ảnh từ magic bytes (không tin extension từ client).
    /// Chỉ chấp nhận jpg/jpeg, png, webp.
    /// </summary>
    public static class ImageContentHelper
    {
        public static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

        /// <summary>
        /// Decode base64 (có thể có prefix data:image/...;base64,) rồi phát hiện extension từ nội dung.
        /// </summary>
        public static bool TryDecodeAndDetect(
            string? imageBase64,
            out byte[] bytes,
            out string extension,
            out string contentType)
        {
            bytes = Array.Empty<byte>();
            extension = string.Empty;
            contentType = string.Empty;

            if (string.IsNullOrWhiteSpace(imageBase64))
                return false;

            var raw = imageBase64.Trim();
            var commaIndex = raw.IndexOf(',');
            if (raw.StartsWith("data:", StringComparison.OrdinalIgnoreCase) && commaIndex >= 0)
                raw = raw[(commaIndex + 1)..];

            try
            {
                bytes = Convert.FromBase64String(raw);
            }
            catch (FormatException)
            {
                return false;
            }

            return TryDetectExtension(bytes, out extension, out contentType);
        }

        /// <summary>
        /// Phát hiện extension từ magic bytes. Trả false nếu không phải ảnh hợp lệ / không nằm trong danh sách cho phép.
        /// </summary>
        public static bool TryDetectExtension(byte[] content, out string extension, out string contentType)
        {
            extension = string.Empty;
            contentType = string.Empty;

            if (content == null || content.Length < 12)
                return false;

            // PNG: 89 50 4E 47 0D 0A 1A 0A
            if (content[0] == 0x89 && content[1] == 0x50 && content[2] == 0x4E && content[3] == 0x47
                && content[4] == 0x0D && content[5] == 0x0A && content[6] == 0x1A && content[7] == 0x0A)
            {
                extension = ".png";
                contentType = "image/png";
                return true;
            }

            // JPEG: FF D8 FF
            if (content[0] == 0xFF && content[1] == 0xD8 && content[2] == 0xFF)
            {
                extension = ".jpg";
                contentType = "image/jpeg";
                return true;
            }

            // WEBP: RIFF....WEBP
            if (content[0] == (byte)'R' && content[1] == (byte)'I' && content[2] == (byte)'F' && content[3] == (byte)'F'
                && content[8] == (byte)'W' && content[9] == (byte)'E' && content[10] == (byte)'B' && content[11] == (byte)'P')
            {
                extension = ".webp";
                contentType = "image/webp";
                return true;
            }

            return false;
        }

        /// <summary>
        /// Kiểm tra nội dung file khớp với extension khai báo (defense in depth ở consumer).
        /// </summary>
        public static bool MatchesDeclaredExtension(byte[] content, string? declaredFileName)
        {
            if (!TryDetectExtension(content, out var detected, out _))
                return false;

            var declared = Path.GetExtension(declaredFileName ?? string.Empty).ToLowerInvariant();
            if (string.IsNullOrEmpty(declared))
                return false;

            if (declared == ".jpeg")
                declared = ".jpg";

            var normalizedDetected = detected == ".jpeg" ? ".jpg" : detected;
            return declared == normalizedDetected;
        }
    }
}
