# Azure Entra External ID — What Changed and How to Set It Up

This covers everything we added to wire up Microsoft Entra External ID authentication on the backend. The frontend side is coming in a separate update.

---

## What actually changed

### `pom.xml`
Added two new dependencies:
- `spring-boot-starter-oauth2-resource-server` — this is what makes Spring automatically validate JWT tokens on every request. Without this, any request would go straight through with no checks.
- `h2` (test scope only) — an in-memory database so our tests don't need a real PostgreSQL connection to run.

### `SecurityConfig.java`
This is the big one. Before, it was set to let everything through (`permitAll`). Now it:
- Blocks every request that doesn't have a valid JWT token (returns 401)
- Validates the token's signature using Azure's public keys (auto-downloaded from the issuer URI on startup — you don't have to manage keys yourself)
- Checks that the token was issued specifically for our backend app, not some other app in the same tenant
- Keeps sessions stateless (no cookies, every request stands alone with its token)

### `User.java`
Added an `azureOid` field. This is the user's unique ID from Azure (from the `sub` claim in their JWT). It never changes, even if they update their email or name. It's how we match a token to a database row.

### `UserRepository.java`
Added `findByAzureOid(String azureOid)`. Spring auto-generates the SQL for this from the method name — no manual query needed. Used by `AuthController` to look up a user by their Azure ID.

### `AuthController.java` (new file)
One endpoint: `POST /auth/me`. The frontend calls this after every login. It:
1. Reads the `sub` claim from the JWT (the user's Azure OID)
2. Looks for an existing user with that OID
3. If found — returns them (returning login)
4. If not found — creates a new user row using their email, given_name, and family_name from the token, then returns them (first login)

This is how the app auto-provisions users on first login without a separate signup flow.

### `application.properties-template`
Added two new config placeholders that need to be filled in `application.properties`:
```
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://<TENANT_NAME>.ciamlogin.com/<TENANT_ID>/v2.0
azure.entra.client-id=<BACKEND_CLIENT_ID>
```

---

## How to set up your local `application.properties`

Copy `application.properties-template` to `application.properties` (same folder) and fill in:

| Property | What to put |
|---|---|
| `spring.datasource.url` | Your Azure PostgreSQL JDBC URL |
| `spring.datasource.username` | Your DB username |
| `spring.datasource.password` | Your DB password |
| `azure.storage.connection-string` | Azure Blob Storage connection string |
| `azure.storage.container-name` | Blob container name |
| `spring.security.oauth2.resourceserver.jwt.issuer-uri` | `https://locationreviewapp.ciamlogin.com/<TENANT_ID>/v2.0` |
| `azure.entra.client-id` | The backend app's client ID from Azure |

`application.properties` is gitignored — never commit it, it has secrets in it.

---

## Tests

Three test files cover this:

- `SecurityConfigTest` — checks that a request with no token gets a 401 back
- `AuthControllerTest` — checks that first login creates a user, second login returns the same user (no duplicates), and no token = 401
- `ApplicationTests` — just checks the Spring context loads correctly

All tests use H2 (in-memory DB) and mocked Azure connections so they run without any real credentials.

Run them with:
```bash
./mvnw test
```
Expected: 5 tests, all pass.
