using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Staffs.Queries.GetAllStaffs
{
    public class GetAllStaffHandler : IRequestHandler<GetAllStaffQuery, Result<PagedResult<StaffDto>>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IMapper mapper;

        public GetAllStaffHandler(IStaffSqlRepository staffSqlRepository, IMapper mapper)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<StaffDto>>> Handle(GetAllStaffQuery request, CancellationToken cancellationToken)
        {
            var query = staffSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.FullName.StartsWith(request.Filter) 
                                      || x.Phone == request.Filter 
                                      || x.User.Email == request.Filter
                                      || x.Code == request.Filter);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "email" => request.IsDescending ? query.OrderByDescending(x => x.User.Email) : query.OrderBy(x => x.User.Email),
                "fullname" => request.IsDescending ? query.OrderByDescending(x => x.FullName) : query.OrderBy(x => x.FullName),
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            query = query.Include(x => x.User);

            PagedResult<Staff> paged = await query.ToPagedAsync(request, cancellationToken);

            PagedResult<StaffDto> pagedDto = new()
            {
                Items = mapper.Map<List<StaffDto>>(paged.Items),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };

            return Result<PagedResult<StaffDto>>.Success(pagedDto);
        }
    }
}
