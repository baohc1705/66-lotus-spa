using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTodaySummary
{
    public class GetTodaySummaryQuery : IRequest<Result<TodaySummaryDto>>
    {
        public int? SalonId { get; set; }
    }
}
