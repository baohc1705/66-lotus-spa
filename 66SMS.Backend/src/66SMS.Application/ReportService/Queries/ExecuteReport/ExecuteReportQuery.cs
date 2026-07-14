using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.ReportService.Queries.ExecuteReport
{
    public class ExecuteReportQuery : IRequest<Result<IReadOnlyList<IDictionary<string, object?>>>>
    {
        public string ProcedureKey { get; set; } = string.Empty;

        public Dictionary<string, object?> Values { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    }
}
