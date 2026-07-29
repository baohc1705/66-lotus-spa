using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
  
    public static class AppointmentPaymentCalculator
    {
        // Fallback cuối nếu chi nhánh chưa có cấu hình
        public const int DefaultDepositPercent = 20;

        public static async Task<int> ResolveDepositPercentAsync(
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            int? salonId,
            CancellationToken cancellationToken = default)
        {
            if (!salonId.HasValue)
            {
                return DefaultDepositPercent;
            }

            var percent = await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.SalonId == salonId.Value)
                .Select(x => x.DepositPercent)
                .FirstOrDefaultAsync(cancellationToken);

            return percent ?? DefaultDepositPercent;
        }

        public static async Task<int> GetEffectiveDepositPercentAsync(
            Appointment appointment,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            CancellationToken cancellationToken = default)
        {
            if (appointment.DepositPercent.HasValue)
            {
                return appointment.DepositPercent.Value;
            }

            return await ResolveDepositPercentAsync(
                configAppointmentSqlRepository,
                appointment.SalonId,
                cancellationToken);
        }

        public static async Task<Dictionary<int, int>> LoadDepositPercentBySalonAsync(
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            IEnumerable<int?> salonIds,
            CancellationToken cancellationToken = default)
        {
            var ids = salonIds
                .Where(x => x.HasValue)
                .Select(x => x!.Value)
                .Distinct()
                .ToList();

            if (ids.Count == 0)
            {
                return new Dictionary<int, int>();
            }

            return await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.SalonId != null
                    && ids.Contains(x.SalonId.Value)
                    && x.DepositPercent != null)
                .ToDictionaryAsync(
                    x => x.SalonId!.Value,
                    x => x.DepositPercent!.Value,
                    cancellationToken);
        }

        public static int GetEffectiveDepositPercent(
            Appointment appointment,
            IReadOnlyDictionary<int, int>? depositPercentBySalon = null)
        {
            if (appointment.DepositPercent.HasValue)
            {
                return appointment.DepositPercent.Value;
            }

            if (appointment.SalonId.HasValue
                && depositPercentBySalon != null
                && depositPercentBySalon.TryGetValue(appointment.SalonId.Value, out var fromConfig))
            {
                return fromConfig;
            }

            return DefaultDepositPercent;
        }

        public static decimal GetDepositAmount(decimal? totalAmount, int depositPercent = DefaultDepositPercent)
        {
            var total = totalAmount ?? 0m;
            if (total <= 0m)
            {
                return 0m;
            }

            return Math.Round(total * depositPercent / 100m, 0, MidpointRounding.AwayFromZero);
        }

        public static decimal GetDepositAmount(
            Appointment appointment,
            IReadOnlyDictionary<int, int>? depositPercentBySalon = null) =>
            GetDepositAmount(appointment.TotalAmount, GetEffectiveDepositPercent(appointment, depositPercentBySalon));

        public static decimal GetRemainingAmount(Appointment appointment) =>
            Math.Max(0m, appointment.TotalAmount - appointment.PaidAmount);

        public static bool HasDepositPaid(
            Appointment appointment,
            IReadOnlyDictionary<int, int>? depositPercentBySalon = null) =>
            appointment.PaidAmount >= GetDepositAmount(appointment, depositPercentBySalon);

        public static bool IsFullyPaid(Appointment appointment) =>
            appointment.PaidAmount >= appointment.TotalAmount;
    }
}
