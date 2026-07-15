using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Nhận diện lỗi SQL Server unique / deadlock khi khóa slot (không phụ thuộc SqlClient ở Application).
    /// </summary>
    public static class BookingDbConcurrency
    {
        public const int MaxDeadlockRetries = 2;

        public static bool IsUniqueViolation(Exception ex)
        {
            for (var e = ex; e != null; e = e.InnerException!)
            {
                if (TryGetSqlNumber(e) is 2601 or 2627)
                    return true;

                if (e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase)
                    || e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase)
                    || e.Message.Contains("UX_slot_lock_active", StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }

        public static bool IsDeadlock(Exception ex)
        {
            for (var e = ex; e != null; e = e.InnerException!)
            {
                if (TryGetSqlNumber(e) is 1205)
                    return true;

                if (e.Message.Contains("deadlock", StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }

        public static bool IsUniqueOrDeadlock(DbUpdateException ex)
            => IsUniqueViolation(ex) || IsDeadlock(ex);

        private static int? TryGetSqlNumber(Exception ex)
        {
            var prop = ex.GetType().GetProperty("Number", BindingFlags.Public | BindingFlags.Instance);
            if (prop?.GetValue(ex) is int number)
                return number;
            return null;
        }
    }
}
