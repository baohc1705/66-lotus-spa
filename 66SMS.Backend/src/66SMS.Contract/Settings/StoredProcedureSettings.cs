namespace _66SMS.Contracts.Settings
{
    /// <summary>
    /// Config-driven stored procedures cho báo cáo/thống kê.
    /// Đổi SP chỉ cần sửa section này + SQL Server, không sửa C#.
    /// </summary>
    public class StoredProcedureSettings
    {
        public static string SectionName => "StoredProcedureSettings";

        public Dictionary<string, StoredProcedureDefinition> Procedures { get; set; } = new();
    }

    public class StoredProcedureDefinition
    {
        public string ProcedureName { get; set; } = string.Empty;

        public int CacheSeconds { get; set; }

        public List<StoredProcedureParameterDefinition> Parameters { get; set; } = new();
    }

    public class StoredProcedureParameterDefinition
    {
        public string Name { get; set; } = string.Empty;

        public string SqlType { get; set; } = "NVarChar";

        /// <summary>query:salonId | body:salonId | route:id | value:fixed</summary>
        public string Source { get; set; } = string.Empty;

        public bool Optional { get; set; }

        public string? DefaultValue { get; set; }
    }
}
