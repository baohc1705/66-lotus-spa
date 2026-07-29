namespace _66SMS.Contracts.Settings
{
   
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
        public string Source { get; set; } = string.Empty;

        public bool Optional { get; set; }

        public string? DefaultValue { get; set; }
    }
}
