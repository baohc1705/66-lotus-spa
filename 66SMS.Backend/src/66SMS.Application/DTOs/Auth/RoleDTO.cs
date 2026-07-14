namespace _66SMS.Application.DTOs.Auth
{
    public class RoleDTO
    {
        public int Id { get; set; }
        public string? Code { get; set; }
        public string Name { get; set; } = null!;
        public string Desctiption { get; set; } = null!;
        public string Status { get; set; } = null!;
        public List<RoleUserDTO>? RoleUsers { get; set; }
        public List<RolePermissionDTO>? RolePermissions { get; set; }
    }

    public class RoleUserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
    }
    public class RolePermissionDTO
    {
        public int Id { get; set; }
        public int PermissionId { get; set; }
        public string Name { get; set; } = null!;
    }
}
