CREATE TABLE notifications (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    salon_id INT NULL,
    domain NVARCHAR(50) NOT NULL,
    event_type NVARCHAR(100) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(1000) NOT NULL,
    payload_json NVARCHAR(MAX) NULL,
    is_read BIT NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT (0),
    created_at DATETIMEOFFSET NOT NULL
);
GO

CREATE INDEX IX_notifications_user_created
    ON notifications (user_id, created_at DESC);
GO

CREATE INDEX IX_notifications_user_domain_created
    ON notifications (user_id, domain, created_at DESC);
GO
