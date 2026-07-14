using _66SMS.API.Abstractions;
using _66SMS.Application.ReportService.Queries.ExecuteReport;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/reports")]
    public class ReportsController : ApiController<ReportsController>
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Gọi stored procedure theo key cấu hình (StoredProcedureSettings).
        /// Query string được map sang params SP theo Source query:xxx.
        /// </summary>
        [HttpGet("{procedureKey}")]
        [Authorize]
        public async Task<IActionResult> Execute(string procedureKey, CancellationToken cancellationToken)
        {
            var values = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            foreach (var pair in Request.Query)
            {
                values[pair.Key] = pair.Value.ToString();
            }

            var result = await _mediator.Send(new ExecuteReportQuery
            {
                ProcedureKey = procedureKey,
                Values = values,
            }, cancellationToken);

            return HandleResult(result);
        }
    }
}
