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

            if (request.SalonId.HasValue)
            {
                query = query.Where(x => x.SalonId == request.SalonId.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.Name.Contains(request.Filter) || (x.Description != null && x.Description.Contains(request.Filter)));
            }

            query = request.OrderBy?.ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "salonname" => request.IsDescending
                    ? query.OrderByDescending(x => x.Salon != null ? x.Salon.Name : null)
                    : query.OrderBy(x => x.Salon != null ? x.Salon.Name : null),
                _ => request.IsDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
            };

            var pagedDto = await query
                .Select(x => new ShiftDTO
                {
                    Id = x.Id,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    Name = x.Name,
                    Description = x.Description,
                    ShiftStart = x.ShiftStart,
                    ShiftEnd = x.ShiftEnd,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ShiftDTO>>.Success(pagedDto);
        }
    }
}
