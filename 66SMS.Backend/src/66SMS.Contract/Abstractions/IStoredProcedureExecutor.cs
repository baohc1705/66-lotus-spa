namespace _66SMS.Contracts.Abstractions
{
    /// <summary>
    /// Gọi stored procedure theo key cấu hình, trả rows động (Dictionary).
    /// </summary>
    public interface IStoredProcedureExecutor
    {
        Task<IReadOnlyList<IDictionary<string, object?>>> ExecuteAsync(
            string procedureKey,
            IReadOnlyDictionary<string, object?> requestValues,
            CancellationToken ct = default);
    }
}
