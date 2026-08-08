namespace _66SMS.Domain.Enums
{
    public enum StatusActiveEnum
    {
        IACTIVED = 0, // Disabled don't show in the other features
        ACTIVED = 1, // Enabled show in the other features
        DELETED = 2, // Deleted don't show in list. Show in undo delete feature
    }
}
