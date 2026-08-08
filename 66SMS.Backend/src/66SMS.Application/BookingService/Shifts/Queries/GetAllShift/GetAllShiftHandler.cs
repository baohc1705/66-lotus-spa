using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.Shifts.Queries.GetAllShift
{
    public class GetAllShiftHandler : IRequestHandler<GetAllShiftQuery, Result<PagedResult<ShiftDTO>>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;

        public GetAllShiftHandler(IShiftSqlRepository shiftSqlRepository)
        {
            this.shiftSqlRepository = shiftSqlRepository;
        }

        public async Task<Result<PagedResult<ShiftDTO>>> Handle(GetAllShiftQuery request, CancellationToken cancellationToken)
        {
            var query = shiftSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.Name.Contains(request.Filter) || (x.Description != null && x.Description.Contains(request.Filter)));
            }

            query = request.OrderBy?.ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                _ => request.IsDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
            };

            var pagedDto = await query
                .Select(x => new ShiftDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    ShiftPeriodDTOs = x.ShiftPeriods!
                        .Select(sp => new ShiftPeriodDTO
                        {
                            Id = sp.Id,
                            ShiftStart = sp.ShiftStart,
                            ShiftEnd = sp.ShiftEnd,
                            EffectiveFrom = sp.EffectiveFrom,
                            EffectiveTo = sp.EffectiveTo,
                            CreatedAt = sp.CreatedAt,
                        })
                        .ToList(),
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ShiftDTO>>.Success(pagedDto);
        }
    }
}
