namespace _66SMS.Application.DTOs.Auth
{
    public class PermissionDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string PermissionKey => $"{Resource}:{Action}";
    }
}
