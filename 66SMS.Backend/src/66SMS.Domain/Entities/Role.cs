using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Role : EntityBase<int>
    {
        public string Code { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<UserRole>? UserRoles { get; set; }
        public List<RolePermission>? RolePermissions { get; set; }
    }
}
