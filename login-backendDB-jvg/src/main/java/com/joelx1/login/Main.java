package com.joelx1.login;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Scanner;

import io.github.cdimascio.dotenv.Dotenv;
@SuppressWarnings("CallToPrintStackTrace")

public class Main
{
    static final Dotenv dotenv = Dotenv.load();
    static final String URL  = dotenv.get("dbA");
    static final String USER = dotenv.get("dbU");
    static final String PASS = dotenv.get("dbP");
    static boolean loggedIn = false;

    public static void main(String[] args)
    {
        Scanner s = new Scanner(System.in);
        System.out.println("--Welcome to location-recommender--");
        printmenu();
        String n = null;
        while (!loggedIn)
        {
            String in = s.nextLine();
            switch (in)
            {
                case "0" -> System.exit(0);
                case "1" -> {signUp(s); printmenu();}
                case "2" -> {n = login(s);}
                default  -> {System.out.println("Invalid option"); System.out.print("Select an Option: ");}
            }
        }

        while (loggedIn)
        {
            System.out.println("Welcome: " + n);
            System.out.println("0. Exit");
            System.out.println("1. View Profile");
            System.out.print("Select an Option: ");
            String in = s.nextLine();
            switch (in)
            {
                case "0" -> System.exit(0);
                case "1" -> {viewInfo(n);}
                default  -> {System.out.println("Invalid option");}
            }
        }
    }

    public static void signUp(Scanner s)
    {
        System.out.print("Enter a username: ");
        String u = s.nextLine();
        while (u.isBlank() || u.length() > 20)
        {
            if (u.isBlank())
                System.out.println("Username cannot be empty!");
            else
                System.out.println("Username must be 20 characters or less!");
            System.out.print("Enter a username: ");
            u = s.nextLine();
        }

        System.out.print("Enter your full name: ");
        String n = s.nextLine();
        while (n.isBlank() || n.length() > 50)
        {
            if (n.isBlank())
                System.out.println("Name cannot be empty!");
            else
                System.out.println("Name must be 50 characters or less!");
            System.out.print("Enter your full name: ");
            n = s.nextLine();
        }

        System.out.print("Enter your email: ");
        String em = s.nextLine();
        while (em.isBlank() || em.length() > 50)
        {
            if (em.isBlank())
                System.out.println("Email cannot be empty!");
            else
                System.out.println("Email must be 50 characters or less!");
            System.out.print("Enter your email: ");
            em = s.nextLine();
        }

        System.out.print("Create your password: ");
        String p = s.nextLine();
        while (p.isBlank() || p.length() > 255)
        {
            if (p.isBlank())
                System.out.println("Password cannot be empty!");
            else
                System.out.println("Password must be 255 characters or less!");
            System.out.print("Create your password: ");
            p = s.nextLine();
        }

        String hash = passHash.hashpw(p);
        String sql  = "INSERT INTO dbo.Users (username, name, email, password, type) VALUES (?, ?, ?, ?, 'user')";

        try (Connection con = DriverManager.getConnection(URL, USER, PASS); PreparedStatement st = con.prepareStatement(sql))
        {
            st.setString(1, u);
            st.setString(2, n);
            st.setString(3, em);
            st.setString(4, hash);
            st.executeUpdate();
            System.out.println("Account created successfully!");
        }
        catch (SQLException e)
        {
            if (e.getErrorCode() == 2627 || e.getErrorCode() == 2601)
                System.out.println("Username or email already exists!");
            else
                e.printStackTrace();
        }
    }

    public static String login(Scanner s)
    {
        System.out.print("Enter your username: ");
        String u = s.nextLine();

        System.out.print("Enter your password: ");
        String p = s.nextLine();

        String sql = "SELECT password FROM dbo.Users WHERE Username = ?";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
             PreparedStatement st = conn.prepareStatement(sql)) {

            st.setString(1, u);
            ResultSet r = st.executeQuery();

            if (r.next())
            {
                String storedHash = r.getString("password");

                if (passHash.checkpw(p, storedHash))
                {
                    System.out.println("Login successful!");
                    loggedIn = true;
                    return u;
                }
                else
                {
                    System.out.println("Wrong password!");
                    printmenu();
                }
            }
            else
            {
                System.out.println("Username not found!");
                printmenu();
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return u;
    }

    public static void viewInfo(String u)
    {
        String sql = "SELECT name, username, email FROM dbo.Users WHERE Username = ?";

        try (Connection con = DriverManager.getConnection(URL, USER, PASS); PreparedStatement st = con.prepareStatement(sql))
        {
            st.setString(1, u);
            ResultSet r = st.executeQuery();

            if (r.next())
            {
                System.out.println("Username: " + r.getString("username"));
                System.out.println("Name: " + r.getString("name"));
                System.out.println("Email: " + r.getString("email"));
            }
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
    }

    public static void printmenu()
    {
        System.out.println("0. Exit");
        System.out.println("1. Sign Up");
        System.out.println("2. Login");
        System.out.print("Select an Option: ");
    }
}