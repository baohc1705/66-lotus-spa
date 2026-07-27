-- Landing banners (Hero slides) + salons.is_primary
-- Run manually on 66LotusSpaDB (Database First — do not use EF migrations)

IF OBJECT_ID(N'dbo.landing_banners', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.landing_banners
    (
        id                   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_landing_banners PRIMARY KEY,
        title                NVARCHAR(200) NOT NULL,
        subtitle             NVARCHAR(1000) NULL,
        brand_label          NVARCHAR(200) NULL,
        image_url            NVARCHAR(MAX) NULL,
        cta_primary_text     NVARCHAR(100) NULL,
        cta_primary_href     NVARCHAR(500) NULL,
        cta_secondary_text   NVARCHAR(100) NULL,
        cta_secondary_href   NVARCHAR(500) NULL,
        sort_order           INT NULL,
        status               INT NOT NULL CONSTRAINT DF_landing_banners_status DEFAULT (1),
        created_at           DATETIMEOFFSET NOT NULL,
        updated_at           DATETIMEOFFSET NULL
    );

    CREATE INDEX IX_landing_banners_status_sort
        ON dbo.landing_banners (status, sort_order);
END
GO

IF COL_LENGTH(N'dbo.salons', N'is_primary') IS NULL
BEGIN
    ALTER TABLE dbo.salons
        ADD is_primary BIT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_salons_is_primary'
      AND object_id = OBJECT_ID(N'dbo.salons')
)
BEGIN
    CREATE UNIQUE INDEX UX_salons_is_primary
        ON dbo.salons (is_primary)
        WHERE is_primary = 1;
END
GO
