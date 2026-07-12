namespace _66SMS.Domain.Constants
{
    public class ProductCategoryConst
    {
        #region Database
        public const string TABLE_NAME = "product_categories";
        public const string FIELD_ID = "id";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_STATUS = "status";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion


        #region Message
        public const string MSG_PRODUCT_CATEGORY_ID_NOT_FOUND = $"{nameof(Entities.ProductCategory)} with id not found";
        #endregion
    }
}
