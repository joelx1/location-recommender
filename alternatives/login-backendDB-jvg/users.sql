CREATE TABLE [dbo].[Users] (
    [Id]       INT           IDENTITY (1, 1) NOT NULL,
    [username] VARCHAR (20)  NOT NULL,
    [name]     VARCHAR (50)  NOT NULL,
    [email]    VARCHAR (50)  NOT NULL,
    [password] VARCHAR (255) NOT NULL,
    [type]     VARCHAR (10)  NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([name] ASC),
    UNIQUE NONCLUSTERED ([username] ASC)
);