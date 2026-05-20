using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Role : EntityAuditTable<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActived { get; set; }

        public List<UserRole> UserRoles { get; set; } = [];
        public List<RolePermission> RolePermissions { get; set; } = [];
    }
}
