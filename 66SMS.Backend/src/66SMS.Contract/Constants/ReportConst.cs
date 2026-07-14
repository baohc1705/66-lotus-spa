namespace _66SMS.Contracts.Constants
{
    /// <summary>
    /// Cache key cho báo cáo gọi stored procedure (không có entity Domain riêng).
    /// </summary>
    public static class ReportConst
    {
        public static string CacheKey(string procedureKey, string paramsHash) =>
            $"report:{procedureKey}:{paramsHash}";
    }
}
