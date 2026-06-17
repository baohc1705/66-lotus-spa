using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.StaffSalons.Queries.GetDetailStaffSalon
{
    public class GetDetailStaffSalonHandler : IRequestHandler<GetDetailStaffSalonQuery, Result<StaffSalonDto>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IMapper mapper;

        public GetDetailStaffSalonHandler(IStaffSalonSqlRepository staffSalonSqlRepository, IMapper mapper)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<StaffSalonDto>> Handle(GetDetailStaffSalonQuery request, CancellationToken cancellationToken)
        {
            StaffSalonDto? staffSalon = await staffSalonSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<StaffSalonDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (staffSalon == null)
                return Result<StaffSalonDto>.NotFound("StaffSalon not found.", ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);

            return Result<StaffSalonDto>.Success(staffSalon);
        }
    }
}
