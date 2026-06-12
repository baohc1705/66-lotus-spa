using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Staffs.Queries.GetDetailStaff
{
    public class GetDetailStaffHandler : IRequestHandler<GetDetailStaffQuery, Result<StaffDto>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IMapper mapper;

        public GetDetailStaffHandler(IStaffSqlRepository staffSqlRepository, IMapper mapper)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<StaffDto>> Handle(GetDetailStaffQuery request, CancellationToken cancellationToken)
        {
            Staff? staff = await staffSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Include(x => x.User)
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null) 
                return Result<StaffDto>.NotFound();

            StaffDto staffDto = mapper.Map<StaffDto>(staff);

            return Result<StaffDto>.Success(staffDto);
        }
    }
}
