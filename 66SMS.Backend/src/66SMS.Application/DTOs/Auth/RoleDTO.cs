namespace _66SMS.Application.DTOs.Auth
{
    public class RoleDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Desctiption { get; set; }
        public string Status { get; set; }
        public List<RoleUserDTO>? RoleUsers { get; set; }
        public List<RolePermissionDTO>? RolePermissions { get; set; }
    }

    public class RoleUserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
    }
    public class RolePermissionDTO
    {
        public int Id { get; set; }
        public int PermissionId { get; set; }
        public string Name { get; set; }
    }
}
