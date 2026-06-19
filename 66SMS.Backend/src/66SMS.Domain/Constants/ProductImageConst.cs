namespace _66SMS.Domain.Constants
{
    public class ProductImageConst
    {
        #region Database
        public const string TABLE_NAME = "product_images";
        public const string FIELD_ID = "id";
        public const string FIELD_PRODUCT_ID = "product_id";
        public const string FIELD_URL = "url";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_IS_PRIMARY = "is_primary";
        #endregion

        #region Constraint
        public const int URL_MAX_LENGTH = 500;
        #endregion

        #region Message
        public const string MSG_PRODUCT_IMAGE_ID_NOT_FOUND = $"{nameof(Entities.ProductImage)} with id not found";
        public const string MSG_PRODUCT_IMAGE_NOT_FOUND = "Product image not found.";
        #endregion
    }
}
