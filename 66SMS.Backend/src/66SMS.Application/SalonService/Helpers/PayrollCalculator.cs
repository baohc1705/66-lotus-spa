namespace _66SMS.Application.SalonService.Helpers
{
    /// <summary>
    /// Tính ngày công chuẩn tháng và lương theo ngày công.
    /// Công thức: Lương = (Lương tháng / Ngày công chuẩn) × Tổng công thực tế
    /// </summary>
    public static class PayrollCalculator
    {
        /// <summary>
        /// Đếm ngày làm việc chuẩn trong tháng (trừ Chủ nhật, tùy chọn trừ Thứ 7).
        /// </summary>
        public static int GetStandardWorkDaysInMonth(int year, int month, bool excludeSaturday = true)
        {
            var daysInMonth = DateTime.DaysInMonth(year, month);
            var count = 0;

            for (var day = 1; day <= daysInMonth; day++)
            {
                var date = new DateTime(year, month, day);
                if (date.DayOfWeek == DayOfWeek.Sunday)
                    continue;
                if (excludeSaturday && date.DayOfWeek == DayOfWeek.Saturday)
                    continue;
                count++;
            }

            return count;
        }

        /// <summary>
        /// Lương theo ngày công: (lương tháng / ngày công chuẩn) × tổng công.
        /// </summary>
        public static decimal CalculateDailySalary(decimal monthlySalary, int standardWorkDays, decimal totalWorkDays)
        {
            if (standardWorkDays <= 0 || totalWorkDays <= 0)
                return 0m;

            return Math.Round(monthlySalary / standardWorkDays * totalWorkDays, 0, MidpointRounding.AwayFromZero);
        }
    }
}
