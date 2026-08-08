namespace _66SMS.Contract.Constants
{
    public class RegexConst
    {
        // 4-50 ký tự, chỉ cho phép chữ, số, dấu chấm và gạch dưới
        public const string USERNAME_REGEX = @"^[a-zA-Z0-9._]{4,50}$";

        // Email chuẩn
        public const string EMAIL_REGEX = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

        // Số điện thoại Việt Nam: 03,05,07,08,09 + 8 số
        public const string VIETNAM_PHONE_REGEX = @"^(03|05|07|08|09)\d{8}$";

        // Tối thiểu 8 ký tự
        // Ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
        public const string PASSWORD_REGEX =@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$";

        // Regex riêng lẻ để check policy Identity
        public const string PASSWORD_REQUIRE_UPPERCASE = @"[A-Z]";
        public const string PASSWORD_REQUIRE_LOWERCASE = @"[a-z]";
        public const string PASSWORD_REQUIRE_DIGIT = @"\d";
        public const string PASSWORD_REQUIRE_NON_ALPHANUMERIC = @"[\W_]";
    }
}
