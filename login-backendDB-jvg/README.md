# Backend Login System

Java CLI tool for user authentication backed by a Microsoft Azure SQL Server database. With options to  sign up, login, and view your profile.

## Prerequisites

- Java 17+
- An [Azure SQL Server](https://portal.azure.com/#servicemenu/SqlAzureExtension/AzureSqlHub/SingleDatabase) database


## Instructions

Donwload this folder as a zip

### 1. Create your Azure SQL Database

1. Create a new **SQL Database** resource
2.
3. Note down your **server name**, **admin username**, and **admin password**
4. Make sure to allow your IP through the **firewall rules** in the Azure portal

<span style="color: aqua;">**OR contact me if you want to just using the database I used**</span>

### 2. Create the Users table

Open a query tool (I used the [mssql](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql) extention on VSCode) connected to your database and run [`users.sql`](users.sql)

### 3. Configure the [`.env`](.env) file

Edit the .env file and fill in your Azure SQL details:

Replace:
- `DBLINK` — the prefix of your Azure SQL server name (e.g. if your server is `myserver.database.windows.net`, use `myserver`)
- `DBNAME` — the name of your database
- `your_admin_username` — your Azure SQL admin username
- `your_admin_password` — your Azure SQL admin password

### 4. Build and run

Run the [`Main.java`](src/main/java/com/joelx1/login/Main.java) file

## Features

- Sign up with username, full name, email and password
- Passwords hashed with BCrypt
- Login with username and password
- View your profile after login
- Input validation on all fields
- Duplicate username/email detection

---

## Project Structure

```
login-backendDB-jvg/
├── .env                          # Database credentials
├── pom.xml                       # Maven dependencies
├── users.sql                     # SQL script to create the Users table
└── src/
    └── main/
        └── java/
            └── com/joelx1/login/
                ├── Main.java     # Main application logic
                └── passHash.java # Password Hashing
```

---

## Dependencies

- [dotenv-java](https://github.com/cdimascio/dotenv-java) - to load the [`.env`](.env) file
- [Spring Security Crypto](https://spring.io/projects/spring-security) - BCrypt hashing for passwords
- [Microsoft JDBC Driver for SQL Server](https://learn.microsoft.com/en-us/sql/connect/jdbc/microsoft-jdbc-driver-for-sql-server) - To connect to the azure sql with java