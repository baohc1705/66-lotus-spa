using _66SMS.Application.DTOs.Employees;
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

namespace _66SMS.Application.Features.Employees.Queries.GetAllEmployee
{
    public class GetAllEmployeeHandler : IRequestHandler<GetAllEmployeeQuery, Result<PagedResult<EmployeeDTO>>>
    {
        private readonly IEmployeeSqlRepository employeeSqlRepository;
        private readonly IMapper mapper;

        public GetAllEmployeeHandler(IEmployeeSqlRepository employeeSqlRepository, IMapper mapper)
        {
            this.employeeSqlRepository = employeeSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<EmployeeDTO>>> Handle(GetAllEmployeeQuery request, CancellationToken cancellationToken)
        {
            var query = employeeSqlRepository.Query();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.FullName.StartsWith(request.Filter) 
                                      || x.Phone == request.Filter 
                                      || x.User.Email == request.Filter
                                      || x.Code == request.Filter);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "email" => query.OrderBy(x => x.User.Email, request.IsDescending),
                "fullname" => query.OrderBy(x => x.FullName, request.IsDescending),
                "code" => query.OrderBy(x => x.Code, request.IsDescending),
                _ => query.OrderBy(x => x.CreatedAt, request.IsDescending)
            };

            query = query.Include(x => x.Include(x => x.User));

            PagedResult<Employee> paged = await query.ToPagedAsync(request, cancellationToken);

            PagedResult<EmployeeDTO> pagedDto = new()
            {
                Items = mapper.Map<List<EmployeeDTO>>(paged.Items),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };

            return Result<PagedResult<EmployeeDTO>>.Success(pagedDto);
        }
    }
}
