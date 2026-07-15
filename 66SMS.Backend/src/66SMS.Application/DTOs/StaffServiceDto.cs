namespace _66SMS.Application.DTOs;

public class StaffServiceDto
{
    public int? Id { get; set; }
    public int? StaffId { get; set; }
    public int? ServiceId { get; set; }
    public int? Status { get; set; }
    public string? SerCode { get; set; }
    public string? SerName { get; set; }
    public int? SerDurationMins { get; set; }
    public decimal? SerCostPrice { get; set; }
    public decimal? SerCommissionRate { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
}
