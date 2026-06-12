using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Permission : EntityBase<int>
    {
        public string Name { get; set; }
        public string Resource { get; set; }
        public string Action { get; set; }
        public string? Description { get; set; }
        public int Status {  get; set; }
        
        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public string PermissionKey => $"{Resource}:{Action}";
        public List<RolePermission>? RolePermissions { get; set; }
    }
}
