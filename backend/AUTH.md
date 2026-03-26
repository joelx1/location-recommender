# Temporary Authentication — Pre Azure Entra ID

## What's this branch for?

So basically we don't have the Azure subscription yet but we still needed some kind of authentication so the API isn't just completely wide open. This branch adds a simple JWT login system to hold us over until we get Entra ID sorted.

Once the Azure subscription is active, most of this gets deleted and replaced, I've left TODO comments everywhere so it's obvious what goes.

---

## How it works

Pretty straightforward flow:

```
1. You send POST /auth/login with your username
2. The server checks if that username exists in the database
3. If it does, you get back a token
4. You attach that token to every request after that
5. No token = 401, wrong token = 401, valid token = you're in
```

That's it. No password check yet because the User model doesn't have a password field, that comes properly when Entra ID takes over and Microsoft handles the login side of things.

---

## Files I added or changed

**New files:**
- `config/JwtUtil.java` — creates and validates tokens, basically the token factory
- `config/JwtFilter.java` — runs on every request and checks if the token is valid
- `controller/AuthController.java` — the actual `/auth/login` endpoint

**Changed files:**
- `config/SecurityConfig.java` — updated so only `/auth/login` is public, everything else needs a token
- `repository/UserRepository.java` — added `findByUsername` so the login can check if a user exists
- `pom.xml` — added the JJWT dependencies
- `application.properties` — added the JWT secret and expiry config

---

## Testing it locally

Make sure your database is running first, then start the app and try these:

**Create a user:**
```http
POST http://localhost:8080/users
Content-Type: application/json

{
  "username": "felix",
  "email": "felix@example.com"
}
```

**Log in and get a token:**
```http
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "username": "felix"
}
```

You'll get back something like:
```json
{ "token": "eyJhbGci..." }
```

**Use the token on any protected route:**
```http
GET http://localhost:8080/locations
Authorization: Bearer eyJhbGci...
```

Without the token you'll get a 401. That's the point.

---

## What changes when we get Azure Entra ID

Not much honestly. The swap is:

- Delete `JwtUtil.java`, `JwtFilter.java`, and the JJWT dependencies
- Update `SecurityConfig.java` to point at Microsoft instead
- Add the tenant ID and client ID to `application.properties`
- `AuthController.java` gets retired — Microsoft handles login from that point

Everything else in the codebase stays the same.

---

## Notes

- The JWT secret in `application.properties` is just a local dev placeholder, not a real secret
- No password field on User yet, authentication is username only for now
- This is intentionally minimal, it's just to unblock development while we wait on the subscription
