using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using ClosedXML.Excel;

namespace _66SMS.Infrastructure.Excels
{
    public class RevenueExcelExportService : IRevenueExcelExportService
    {
        public byte[] BuildBySalonWorkbook(
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueBySalonRowDto> salonRows,
            IReadOnlyList<RevenueBySalonDailyRowDto> dailyRows)
        {
            using var workbook = new XLWorkbook();

            BuildCompareSheet(workbook, from, to, salonRows);
            BuildDailySheet(workbook, from, to, dailyRows);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public byte[] BuildBranchRevenueWorkbook(
            string salonName,
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueByStaffRowDto> staffRows,
            IReadOnlyList<RevenueByServiceRowDto> serviceRows)
        {
            using var workbook = new XLWorkbook();

            BuildStaffSheet(workbook, salonName, from, to, staffRows);
            BuildServiceSheet(workbook, salonName, from, to, serviceRows);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static void BuildStaffSheet(
            XLWorkbook workbook,
            string salonName,
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueByStaffRowDto> staffRows)
        {
            var sheet = workbook.Worksheets.Add("Theo kỹ thuật viên");

            sheet.Cell(1, 1).Value = "Báo cáo doanh thu theo kỹ thuật viên";
            sheet.Cell(1, 1).Style.Font.Bold = true;
            sheet.Range(1, 1, 1, 5).Merge();

            sheet.Cell(2, 1).Value = $"Chi nhánh: {salonName}";
            sheet.Range(2, 1, 2, 5).Merge();

            sheet.Cell(3, 1).Value = $"Kỳ: {from:dd/MM/yyyy} – {to:dd/MM/yyyy}";
            sheet.Range(3, 1, 3, 5).Merge();

            var headers = new[] { "STT", "Tên kỹ thuật viên", "Số lượng", "Doanh thu", "Hoa hồng" };
            for (var i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(5, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            var row = 6;
            var rank = 1;
            decimal totalRevenue = 0;
            decimal totalCommission = 0;
            var totalQty = 0;

            foreach (var item in staffRows)
            {
                sheet.Cell(row, 1).Value = rank;
                sheet.Cell(row, 2).Value = item.StaffName;
                sheet.Cell(row, 3).Value = item.Quantity;
                sheet.Cell(row, 4).Value = item.Revenue;
                sheet.Cell(row, 5).Value = item.Commission;
                FormatMoney(sheet.Range(row, 4, row, 5));

                totalQty += item.Quantity;
                totalRevenue += item.Revenue;
                totalCommission += item.Commission;
                rank++;
                row++;
            }

            sheet.Cell(row, 1).Value = "";
            sheet.Cell(row, 2).Value = "Tổng";
            sheet.Cell(row, 2).Style.Font.Bold = true;
            sheet.Cell(row, 3).Value = totalQty;
            sheet.Cell(row, 4).Value = totalRevenue;
            sheet.Cell(row, 5).Value = totalCommission;
            sheet.Range(row, 1, row, 5).Style.Font.Bold = true;
            FormatMoney(sheet.Range(row, 4, row, 5));

            sheet.Columns().AdjustToContents();
        }

        private static void BuildServiceSheet(
            XLWorkbook workbook,
            string salonName,
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueByServiceRowDto> serviceRows)
        {
            var sheet = workbook.Worksheets.Add("Theo dịch vụ");

            sheet.Cell(1, 1).Value = "Báo cáo doanh thu theo dịch vụ";
            sheet.Cell(1, 1).Style.Font.Bold = true;
            sheet.Range(1, 1, 1, 4).Merge();

            sheet.Cell(2, 1).Value = $"Chi nhánh: {salonName}";
            sheet.Range(2, 1, 2, 4).Merge();

            sheet.Cell(3, 1).Value = $"Kỳ: {from:dd/MM/yyyy} – {to:dd/MM/yyyy}";
            sheet.Range(3, 1, 3, 4).Merge();

            var headers = new[] { "STT", "Tên dịch vụ", "Số lượng", "Doanh thu" };
            for (var i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(5, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            var row = 6;
            var rank = 1;
            decimal totalRevenue = 0;
            var totalQty = 0;

            foreach (var item in serviceRows)
            {
                sheet.Cell(row, 1).Value = rank;
                sheet.Cell(row, 2).Value = item.ItemName;
                sheet.Cell(row, 3).Value = item.Quantity;
                sheet.Cell(row, 4).Value = item.Revenue;
                FormatMoney(sheet.Cell(row, 4));

                totalQty += item.Quantity;
                totalRevenue += item.Revenue;
                rank++;
                row++;
            }

            sheet.Cell(row, 1).Value = "";
            sheet.Cell(row, 2).Value = "Tổng";
            sheet.Cell(row, 2).Style.Font.Bold = true;
            sheet.Cell(row, 3).Value = totalQty;
            sheet.Cell(row, 4).Value = totalRevenue;
            sheet.Range(row, 1, row, 4).Style.Font.Bold = true;
            FormatMoney(sheet.Cell(row, 4));

            sheet.Columns().AdjustToContents();
        }

        private static void BuildCompareSheet(
            XLWorkbook workbook,
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueBySalonRowDto> salonRows)
        {
            var sheet = workbook.Worksheets.Add("So sánh chi nhánh");

            sheet.Cell(1, 1).Value = "Báo cáo so sánh doanh thu theo chi nhánh";
            sheet.Cell(1, 1).Style.Font.Bold = true;
            sheet.Range(1, 1, 1, 11).Merge();

            sheet.Cell(2, 1).Value = $"Kỳ: {from:dd/MM/yyyy} – {to:dd/MM/yyyy}";
            sheet.Range(2, 1, 2, 11).Merge();

            var headers = new[]
            {
                "Hạng", "Mã CN", "Tên chi nhánh", "Doanh thu", "Tiền thu",
                "Chi (HH+hoàn)", "Lãi ròng ước tính", "Số HĐ", "AOV",
                "% đóng góp DT", "% vs kỳ trước",
            };

            for (var i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(4, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            var current = salonRows
                .Where(r => string.Equals(r.PeriodTag, "current", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(r => r.GrossRevenue)
                .ToList();

            var previousBySalon = salonRows
                .Where(r => string.Equals(r.PeriodTag, "previous", StringComparison.OrdinalIgnoreCase))
                .ToDictionary(r => r.SalonId);

            var totalGross = current.Sum(r => r.GrossRevenue);
            var totalCashIn = current.Sum(r => r.CashIn);
            var totalCashOut = current.Sum(r => r.CashOut);
            var totalTxn = current.Sum(r => r.TransactionCount);

            var row = 5;
            var rank = 1;
            foreach (var item in current)
            {
                var net = item.CashIn - item.CashOut;
                var aov = item.TransactionCount > 0
                    ? Math.Round(item.GrossRevenue / item.TransactionCount, 0)
                    : 0;
                var contrib = totalGross > 0
                    ? Math.Round(item.GrossRevenue * 100 / totalGross, 1)
                    : 0;

                var growth = 0m;
                if (previousBySalon.TryGetValue(item.SalonId, out var prev) && prev.GrossRevenue > 0)
                {
                    growth = Math.Round((item.GrossRevenue - prev.GrossRevenue) * 100 / prev.GrossRevenue, 1);
                }

                sheet.Cell(row, 1).Value = rank;
                sheet.Cell(row, 2).Value = item.SalonCode;
                sheet.Cell(row, 3).Value = item.SalonName;
                sheet.Cell(row, 4).Value = item.GrossRevenue;
                sheet.Cell(row, 5).Value = item.CashIn;
                sheet.Cell(row, 6).Value = item.CashOut;
                sheet.Cell(row, 7).Value = net;
                sheet.Cell(row, 8).Value = item.TransactionCount;
                sheet.Cell(row, 9).Value = aov;
                sheet.Cell(row, 10).Value = contrib;
                sheet.Cell(row, 11).Value = growth;

                FormatMoney(sheet.Range(row, 4, row, 7));
                FormatMoney(sheet.Cell(row, 9));
                sheet.Cell(row, 10).Style.NumberFormat.Format = "0.0\"%\"";
                sheet.Cell(row, 11).Style.NumberFormat.Format = "0.0\"%\"";

                rank++;
                row++;
            }

            // Tổng hệ thống
            sheet.Cell(row, 1).Value = "";
            sheet.Cell(row, 2).Value = "";
            sheet.Cell(row, 3).Value = "Tổng hệ thống";
            sheet.Cell(row, 3).Style.Font.Bold = true;
            sheet.Cell(row, 4).Value = totalGross;
            sheet.Cell(row, 5).Value = totalCashIn;
            sheet.Cell(row, 6).Value = totalCashOut;
            sheet.Cell(row, 7).Value = totalCashIn - totalCashOut;
            sheet.Cell(row, 8).Value = totalTxn;
            sheet.Cell(row, 9).Value = totalTxn > 0 ? Math.Round(totalGross / totalTxn, 0) : 0;
            sheet.Cell(row, 10).Value = totalGross > 0 ? 100 : 0;
            sheet.Cell(row, 11).Value = "";
            sheet.Range(row, 1, row, 11).Style.Font.Bold = true;
            FormatMoney(sheet.Range(row, 4, row, 7));
            FormatMoney(sheet.Cell(row, 9));

            sheet.Columns().AdjustToContents();
        }

        private static void BuildDailySheet(
            XLWorkbook workbook,
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueBySalonDailyRowDto> dailyRows)
        {
            var sheet = workbook.Worksheets.Add("Theo ngày");

            sheet.Cell(1, 1).Value = "Doanh thu theo ngày × chi nhánh";
            sheet.Cell(1, 1).Style.Font.Bold = true;

            sheet.Cell(2, 1).Value = $"Kỳ: {from:dd/MM/yyyy} – {to:dd/MM/yyyy}";

            var salonNames = dailyRows
                .Select(r => r.SalonName)
                .Distinct()
                .OrderBy(n => n)
                .ToList();

            // Nếu chưa có giao dịch, vẫn hiện header Ngày + Tổng
            sheet.Cell(4, 1).Value = "Ngày";
            sheet.Cell(4, 1).Style.Font.Bold = true;
            sheet.Cell(4, 1).Style.Fill.BackgroundColor = XLColor.LightGray;

            for (var i = 0; i < salonNames.Count; i++)
            {
                var cell = sheet.Cell(4, i + 2);
                cell.Value = salonNames[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            var totalCol = salonNames.Count + 2;
            sheet.Cell(4, totalCol).Value = "Tổng";
            sheet.Cell(4, totalCol).Style.Font.Bold = true;
            sheet.Cell(4, totalCol).Style.Fill.BackgroundColor = XLColor.LightGray;

            var lookup = dailyRows.ToDictionary(
                r => (r.Date, r.SalonName),
                r => r.GrossRevenue);

            var row = 5;
            for (var d = from; d <= to; d = d.AddDays(1))
            {
                sheet.Cell(row, 1).Value = d.ToString("dd/MM/yyyy");
                decimal dayTotal = 0;

                for (var i = 0; i < salonNames.Count; i++)
                {
                    lookup.TryGetValue((d, salonNames[i]), out var amount);
                    sheet.Cell(row, i + 2).Value = amount;
                    FormatMoney(sheet.Cell(row, i + 2));
                    dayTotal += amount;
                }

                sheet.Cell(row, totalCol).Value = dayTotal;
                FormatMoney(sheet.Cell(row, totalCol));
                row++;
            }

            sheet.Columns().AdjustToContents();
        }

        private static void FormatMoney(IXLRange range)
        {
            range.Style.NumberFormat.Format = "#,##0";
        }

        private static void FormatMoney(IXLCell cell)
        {
            cell.Style.NumberFormat.Format = "#,##0";
        }
    }
}
