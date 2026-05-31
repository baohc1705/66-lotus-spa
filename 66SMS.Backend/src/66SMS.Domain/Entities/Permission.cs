using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Domain.Enums;

namespace _66SMS.Domain.Entities
{
    public class Permission : EntityAuditTable<int>
    {
        public string Name { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public PermissionStatus Status {  get; set; }
        public string PermissionKey => $"{Resource}:{Action}";
        public List<RolePermission>? RolePermissions { get; set; }
    }
}
