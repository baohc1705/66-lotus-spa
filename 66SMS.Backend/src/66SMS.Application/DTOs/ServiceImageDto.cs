namespace _66SMS.Application.DTOs
{
    public class ServiceImageDto
    {
        public int? Id { get; set; }
        public int? ServiceId { get; set; }
        public string? Url { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
