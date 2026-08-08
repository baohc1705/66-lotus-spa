using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Queries.GetAllTimeSlot
{
    public class GetAllTimeSlotHandler : IRequestHandler<GetAllTimeSlotQuery, Result<PagedResult<TimeSlotDto>>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;

        public GetAllTimeSlotHandler(ITimeSlotSqlRepository timeSlotSqlRepository)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
        }

        public async Task<Result<PagedResult<TimeSlotDto>>> Handle(GetAllTimeSlotQuery request, CancellationToken cancellationToken)
        {
            var result = await timeSlotSqlRepository.AsQueryable()
                .Select(x => new TimeSlotDto
                {
                    Id = x.Id,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<TimeSlotDto>>.Success(result);
        }
    }
}
