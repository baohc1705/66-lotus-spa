using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Domain.Enums;

namespace _66SMS.Domain.Entities
{
    public class Role : EntityAuditTable<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public RoleStatus Status { get; set; }

        public List<UserRole>? UserRoles { get; set; }
        public List<RolePermission>? RolePermissions { get; set; }
    }
}
