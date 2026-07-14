using System.Data;
using System.Globalization;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Settings;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace _66SMS.Persistence.StoredProcedures
{
    public class SqlStoredProcedureExecutor : IStoredProcedureExecutor
    {
        private readonly string _connectionString;
        private readonly StoredProcedureSettings _settings;
        private readonly ICacheService _cacheService;
        private readonly ILogger<SqlStoredProcedureExecutor> _logger;

        public SqlStoredProcedureExecutor(
            IConfiguration configuration,
            IOptions<StoredProcedureSettings> settings,
            ILogger<SqlStoredProcedureExecutor> logger,
            ICacheService cacheService)
        {
            _connectionString = configuration.GetConnectionString(DatabaseConst.CONN_SQL_SERVER)
                ?? configuration.GetConnectionString("SqlServerConn")
                ?? throw new InvalidOperationException("SQL Server connection string is missing.");
            _settings = settings.Value;
            _logger = logger;
            _cacheService = cacheService;
        }

        public async Task<IReadOnlyList<IDictionary<string, object?>>> ExecuteAsync(
            string procedureKey,
            IReadOnlyDictionary<string, object?> requestValues,
            CancellationToken ct = default)
        {
            if (!_settings.Procedures.TryGetValue(procedureKey, out var definition))
            {
                throw new KeyNotFoundException($"Stored procedure key '{procedureKey}' is not configured.");
            }

            string? cacheKey = null;
            if (definition.CacheSeconds > 0)
            {
                var hash = CacheKeyHash.FromObject(requestValues);
                cacheKey = ReportConst.CacheKey(procedureKey, hash);
                var cached = await _cacheService.GetAsync<List<Dictionary<string, object?>>>(cacheKey, ct);
                if (cached is not null)
                {
                    return cached.Cast<IDictionary<string, object?>>().ToList();
                }
            }

            var rows = new List<IDictionary<string, object?>>();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(ct);

            await using var command = connection.CreateCommand();
            command.CommandType = CommandType.StoredProcedure;
            command.CommandText = definition.ProcedureName;

            foreach (var paramDef in definition.Parameters)
            {
                var value = ResolveParameterValue(paramDef, requestValues);
                if (value is null && paramDef.Optional)
                {
                    command.Parameters.Add(new SqlParameter(paramDef.Name, MapSqlDbType(paramDef.SqlType))
                    {
                        Value = DBNull.Value,
                    });
                    continue;
                }

                if (value is null && !paramDef.Optional)
                {
                    throw new ArgumentException($"Required parameter '{paramDef.Name}' is missing for '{procedureKey}'.");
                }

                command.Parameters.Add(CreateSqlParameter(paramDef.Name, paramDef.SqlType, value!));
            }

            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                for (var i = 0; i < reader.FieldCount; i++)
                {
                    var name = reader.GetName(i);
                    row[name] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                }

                rows.Add(row);
            }

            if (cacheKey is not null)
            {
                var cachePayload = rows
                    .Select(r => new Dictionary<string, object?>(r, StringComparer.OrdinalIgnoreCase))
                    .ToList();
                await _cacheService.SetAsync(
                    cacheKey,
                    cachePayload,
                    TimeSpan.FromSeconds(definition.CacheSeconds),
                    ct);
            }

            return rows;
        }

        private static object? ResolveParameterValue(
            StoredProcedureParameterDefinition paramDef,
            IReadOnlyDictionary<string, object?> requestValues)
        {
            if (string.IsNullOrWhiteSpace(paramDef.Source))
            {
                return paramDef.DefaultValue;
            }

            var parts = paramDef.Source.Split(':', 2);
            if (parts.Length != 2)
            {
                return paramDef.DefaultValue;
            }

            var sourceType = parts[0].Trim().ToLowerInvariant();
            var sourceKey = parts[1].Trim();

            if (sourceType == "value")
            {
                return sourceKey;
            }

            // query / body / route — caller đã flatten vào requestValues theo tên field
            if (requestValues.TryGetValue(sourceKey, out var value) && value is not null)
            {
                var text = value.ToString();
                if (!string.IsNullOrWhiteSpace(text))
                    return text;
            }

            return paramDef.DefaultValue;
        }

        private static SqlParameter CreateSqlParameter(string name, string sqlType, object value)
        {
            var dbType = MapSqlDbType(sqlType);
            var converted = ConvertValue(sqlType, value);
            return new SqlParameter(name, dbType) { Value = converted ?? DBNull.Value };
        }

        private static SqlDbType MapSqlDbType(string sqlType) =>
            sqlType.Trim().ToLowerInvariant() switch
            {
                "int" => SqlDbType.Int,
                "bigint" => SqlDbType.BigInt,
                "bit" => SqlDbType.Bit,
                "date" => SqlDbType.Date,
                "datetime" => SqlDbType.DateTime,
                "datetime2" => SqlDbType.DateTime2,
                "decimal" or "money" or "numeric" => SqlDbType.Decimal,
                "float" => SqlDbType.Float,
                "uniqueidentifier" => SqlDbType.UniqueIdentifier,
                _ => SqlDbType.NVarChar,
            };

        private static object? ConvertValue(string sqlType, object value)
        {
            var text = value.ToString();
            if (string.IsNullOrWhiteSpace(text))
                return null;

            return sqlType.Trim().ToLowerInvariant() switch
            {
                "int" => int.Parse(text, CultureInfo.InvariantCulture),
                "bigint" => long.Parse(text, CultureInfo.InvariantCulture),
                "bit" => bool.Parse(text),
                "date" => DateOnly.Parse(text, CultureInfo.InvariantCulture),
                "datetime" or "datetime2" => DateTime.Parse(text, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
                "decimal" or "money" or "numeric" => decimal.Parse(text, CultureInfo.InvariantCulture),
                "float" => double.Parse(text, CultureInfo.InvariantCulture),
                "uniqueidentifier" => Guid.Parse(text),
                _ => text,
            };
        }
    }
}
