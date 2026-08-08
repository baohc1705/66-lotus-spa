namespace _66SMS.Contract.Constants;

public static class JwtClaimConst
{
    public const string ProfileType = "profile_type";
    public const string Profile = "profile";

    // Giá trị profile_type (string trong claim + DTO)
    public const string ProfileTypeNone = "none";
    public const string ProfileTypeCustomer = "customer";
    public const string ProfileTypeStaff = "staff";
}
