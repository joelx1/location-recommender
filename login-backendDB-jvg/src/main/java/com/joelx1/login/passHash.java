package com.joelx1.login;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class passHash
{
    private static final BCryptPasswordEncoder e = new BCryptPasswordEncoder();
    public static String hashpw(String p)
    {
        return e.encode(p);
    }
    public static boolean checkpw(String p, String h)
    {
        return e.matches(p, h);
    }
}