using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.ReportService.Queries.ExecuteReport
{
    public class ExecuteReportHandler
        : IRequestHandler<ExecuteReportQuery, Result<IReadOnlyList<IDictionary<string, object?>>>>
    {
        private readonly IStoredProcedureExecutor _executor;

        public ExecuteReportHandler(IStoredProcedureExecutor executor)
        {
            _executor = executor;
        }

        public async Task<Result<IReadOnlyList<IDictionary<string, object?>>>> Handle(
            ExecuteReportQuery request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.ProcedureKey))
            {
                return Result<IReadOnlyList<IDictionary<string, object?>>>.BadRequest("procedureKey is required.");
            }

            try
            {
                var rows = await _executor.ExecuteAsync(
                    request.ProcedureKey.Trim(),
                    request.Values,
                    cancellationToken);

                return Result<IReadOnlyList<IDictionary<string, object?>>>.Success(rows);
            }
            catch (KeyNotFoundException ex)
            {
                return Result<IReadOnlyList<IDictionary<string, object?>>>.NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return Result<IReadOnlyList<IDictionary<string, object?>>>.BadRequest(ex.Message);
            }
        }
    }
}
