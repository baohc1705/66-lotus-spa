using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Queries.GetAllTimeSlot
{
    public class GetAllTimeSlotHandler : IRequestHandler<GetAllTimeSlotQuery, Result<PagedResult<TimeSlotDto>>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly IMapper mapper;

        public GetAllTimeSlotHandler(
            ITimeSlotSqlRepository timeSlotSqlRepository,
            IMapper mapper)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<TimeSlotDto>>> Handle(GetAllTimeSlotQuery request, CancellationToken cancellationToken)
        {
            IQueryable<TimeSlot> query = timeSlotSqlRepository.AsQueryable();

            PagedResult<TimeSlotDto> result = await query
                .ProjectTo<TimeSlotDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<TimeSlotDto>>.Success(result);
        }
    }
}
