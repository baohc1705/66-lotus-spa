using System.Text;

namespace _66SMS.Infrastructure.Payments.VnPay
{
    public class VnPayLibrary
    {
        // Danh sách param gởi đi và nhận về sẽ được sắp xếp theo Alphabet trước khi tạo chữ ký
        private readonly SortedList<string, string> requestData = new SortedList<string, string>(new VnPayCompare());
        private readonly SortedList<string, string> responseData = new SortedList<string, string>(new VnPayCompare());

        /// <summary>
        /// Logic thêm dữ liệu gửi đi VNPAY
        /// </summary>
        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                requestData.Add(key, value);
            }
        }

        /// <summary>
        /// Logic thêm dữ liệu nhận về từ VNPAY
        /// </summary>
        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                responseData.Add(key, value);
            }
        }

        /// <summary>
        /// Get dữ liệu phản hồi từ vnpay
        /// </summary>
        public string GetResponseData(string key)
        {
            return responseData.TryGetValue(key, out var retValue) ? retValue : string.Empty;
        }

        /// <summary>
        /// Logic tạo URL để chuyển hướng sang VNPAY
        /// </summary>
        /// <param name="baseUrl">URL</param>
        /// <param name="vnp_HashSecret">Khoa bi mat vnp</param>
        /// <returns></returns>
        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            var data = new StringBuilder();
            foreach (var kv in requestData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    // Nối các param thành chuỗi query: key1=value1&key2=value2
                    data.Append(VnPayUtils.VnPayUrlEncode(kv.Key) + "=" + VnPayUtils.VnPayUrlEncode(kv.Value) + "&");
                }
            }

            var queryString = data.ToString();
            baseUrl += "?" + queryString;
            var signData = queryString;
            if (signData.Length > 0)
            {
                signData = signData.Remove(data.Length - 1, 1); // Xóa ký tự '&' cuối cùng
            }

            // Dùng thuật toán HMACSHA512 để băm chuỗi query kèm HashSecret
            var vnp_SecureHash = VnPayUtils.HmacSHA512(vnp_HashSecret, signData);
            baseUrl += "vnp_SecureHash=" + vnp_SecureHash; // Thêm chữ ký vào cuối URL
            return baseUrl;
        }

        /// <summary>
        /// Logic kiểm tra chữ ký do VNPAY trả về xem có hợp lệ và bị giả mạo không
        /// </summary>
        /// <param name="inputHash"></param>
        /// <param name="secretKey"></param>
        /// <returns></returns>
        public bool ValidateSignature(string inputHash, string secretKey)
        {
            var rspRaw = GetResponseData();
            var myChecksum = VnPayUtils.HmacSHA512(secretKey, rspRaw);
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);

        }

        private string GetResponseData()
        {
            var data = new StringBuilder();
            // Loại bỏ 2 field chữ ký khỏi danh sách tham số trước khi tạo chuỗi checksum kiểm tra
            if (responseData.ContainsKey("vnp_SecureHashType"))
                responseData.Remove("vnp_SecureHashType");
            if (responseData.ContainsKey("vnp_SecureHash"))
                responseData.Remove("vnp_SecureHash");
            foreach (var kv in responseData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    data.Append(VnPayUtils.VnPayUrlEncode(kv.Key) + "=" + VnPayUtils.VnPayUrlEncode(kv.Value) + "&");
                }
            }

            if (data.Length > 0)
                data.Remove(data.Length - 1, 1);
            return data.ToString();
        }
    }
}
