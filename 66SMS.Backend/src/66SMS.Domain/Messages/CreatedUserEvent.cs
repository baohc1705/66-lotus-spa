using _66SMS.Contracts.Messages;
namespace _66SMS.Domain.Messages
{
    /// <summary>
    /// Event sau khi đăng ký user/customer thành công.
    /// Consumer: CreatedUserConsumer — tạo Wallet + MembershipCard mặc định.
    /// </summary>
    public class CreatedUserEvent : DomainEvent
    {
        public int UserId { get; set; }
        public int CustomerId { get; set; }
    }
}
