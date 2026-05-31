create TABLE Shifts (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Name        NVARCHAR(50),
    Description NVARCHAR(500)
);

create TABLE ShiftPeriods (
    Id            INT PRIMARY KEY IDENTITY(1,1),
    ShiftId       INT NOT NULL,
    ShiftStart    time NOT NULL,
    ShiftEnd      time NOT NULL,
    EffectiveFrom DATE NOT NULL,
    EffectiveTo   DATE NULL,
    CreatedAt     DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ShiftPeriods_Shifts FOREIGN KEY (ShiftId) REFERENCES Shifts(Id)
);

create TABLE WorkSchedules (
    Id            INT PRIMARY KEY IDENTITY(1,1),
    ShiftPeriodId INT NOT NULL,
    EmployeeId    INT NOT NULL,
    WorkDate      DATE NOT NULL,
    CONSTRAINT FK_WorkSchedules_ShiftPeriods FOREIGN KEY (ShiftPeriodId) REFERENCES ShiftPeriods(Id),
    CONSTRAINT FK_WorkSchedules_Employees    FOREIGN KEY (EmployeeId)    REFERENCES Employees(Id)
);