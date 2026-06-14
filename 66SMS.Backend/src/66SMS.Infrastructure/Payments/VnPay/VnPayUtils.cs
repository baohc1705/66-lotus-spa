using System.Security.Cryptography;
using System.Text;

namespace _66SMS.Infrastructure.Payments.VnPay
{
    public class VnPayUtils
    {
        // Cần URL Encode theo chuẩn PHP thay vì .NET mặc định
        public static string VnPayUrlEncode(string value)
        {
            return Uri.EscapeDataString(value).Replace("%20", "+");
        }
        // Hàm băm thuật toán HMACSHA512
        public static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }
    }
}
