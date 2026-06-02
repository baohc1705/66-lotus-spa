using _66SMS.Application.DTOs.Employees;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Employees.Queries.GetDetailEmployee
{
    public class GetDetailEmployeeHandler : IRequestHandler<GetDetailEmployeeQuery, Result<EmployeeDTO>>
    {
        private readonly IEmployeeSqlRepository employeeSqlRepository;
        private readonly IMapper mapper;

        public GetDetailEmployeeHandler(IEmployeeSqlRepository employeeSqlRepository, IMapper mapper)
        {
            this.employeeSqlRepository = employeeSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<EmployeeDTO>> Handle(GetDetailEmployeeQuery request, CancellationToken cancellationToken)
        {
            Employee? employee = await employeeSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Include(x => x.User)
                .FirstOrDefaultAsync(cancellationToken);

            if (employee == null) 
                return Result<EmployeeDTO>.NotFound();

            EmployeeDTO employeeDTO = mapper.Map<EmployeeDTO>(employee);

            return Result<EmployeeDTO>.Success(employeeDTO);
        }
    }
}
