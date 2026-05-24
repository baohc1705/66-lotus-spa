namespace _66SMS.Contracts.Shared
{
    public class PageRequest
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchKeyword { get; set; }
        public string? OrderBy { get; set; }
        public bool IsDescending { get; set; } = false;
        public bool IsNotDeleted { get; set; } = true;
    }
}
