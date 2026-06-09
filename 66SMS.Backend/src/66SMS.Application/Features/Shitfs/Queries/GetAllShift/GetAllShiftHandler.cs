using _66SMS.Application.DTOs.Shifts;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Shitfs.Queries.GetAllShift
{
    public class GetAllShiftHandler : IRequestHandler<GetAllShiftQuery, Result<PagedResult<ShiftDTO>>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly IMapper mapper;

        public GetAllShiftHandler(IShiftSqlRepository shiftSqlRepository, IMapper mapper)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.mapper = mapper;
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

            query = query.Include(x => x.ShiftPeriods);

            PagedResult<Shift> paged = await query.ToPagedAsync(request, cancellationToken);

            PagedResult<ShiftDTO> pagedDto = new()
            {
                Items = mapper.Map<List<ShiftDTO>>(paged.Items),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };

            return Result<PagedResult<ShiftDTO>>.Success(pagedDto);
        }
    }
}
