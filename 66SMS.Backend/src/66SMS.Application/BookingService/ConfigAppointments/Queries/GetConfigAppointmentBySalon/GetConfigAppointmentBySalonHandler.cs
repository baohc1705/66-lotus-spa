using _66SMS.Application.DTOs.ConfigAppointments;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.ConfigAppointments.Queries.GetConfigAppointmentBySalon
{
    public class GetConfigAppointmentBySalonHandler
        : IRequestHandler<GetConfigAppointmentBySalonQuery, Result<ConfigAppointmentDto>>
    {
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;

        public GetConfigAppointmentBySalonHandler(
            IConfigAppointmentSqlRepository configAppointmentSqlRepository)
        {
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
        }

        public async Task<Result<ConfigAppointmentDto>> Handle(
            GetConfigAppointmentBySalonQuery request,
            CancellationToken cancellationToken)
        {
            ConfigAppointmentDto? dto = await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.SalonId == request.SalonId)
                .Select(x => new ConfigAppointmentDto
                {
                    Id = x.Id,
                    DepositPercent = x.DepositPercent,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                    SlotMinutes = x.SlotMinutes,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
            {
                // Chưa cấu hình → trả % mặc định để UI đặt lịch vẫn hiển thị đúng
                return Result<ConfigAppointmentDto>.Success(new ConfigAppointmentDto
                {
                    SalonId = request.SalonId,
                    DepositPercent = 20,
                });
            }

            return Result<ConfigAppointmentDto>.Success(dto);
        }
    }
}
