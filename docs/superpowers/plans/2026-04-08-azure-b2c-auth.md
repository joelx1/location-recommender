# Azure B2C Authentication — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add end-to-end Azure B2C authentication so every API request is verified and user identity comes from a real JWT token rather than whatever the caller says it is.

**Architecture:** Frontend uses expo-auth-session to open the B2C hosted login page and receive a JWT access token. The token is attached to every API call as a Bearer header. Spring Boot validates the token's signature using B2C's public keys and auto-provisions a user row on first login via POST /auth/me.

**Tech Stack:** Azure AD B2C (External ID), expo-auth-session, expo-crypto, expo-secure-store, Spring Security OAuth2 Resource Server

---

## Files Overview

### New files
| File | What it does |
|---|---|
| `database/migrations/V002__users_add_azure_oid.sql` | Adds `azure_oid` column to users table |
| `backend/.../controller/AuthController.java` | POST /auth/me — creates or returns the logged-in user |
| `backend/.../src/test/.../config/SecurityConfigTest.java` | Tests that unauthed requests return 401 |
| `backend/.../src/test/.../controller/AuthControllerTest.java` | Tests first login + returning user |
| `frontend/context/AuthContext.tsx` | Global auth state — token, user, login(), logout() |
| `frontend/utils/api.ts` | Shared fetch helper that auto-attaches the Bearer token |

### Modified files
| File | What changes |
|---|---|
| `backend/LocationReviewApp/pom.xml` | Add OAuth2 Resource Server dependency |
| `backend/.../resources/application.properties` | Add B2C JWK URI + client ID (local only, not committed) |
| `backend/.../resources/application.properties-template` | Update template with B2C placeholders |
| `backend/.../config/SecurityConfig.java` | Replace "let everything through" with JWT validation |
| `backend/.../model/User.java` | Add `azureOid` field |
| `backend/.../repository/UserRepository.java` | Add `findByAzureOid` query |
| `frontend/app/_layout.tsx` | Wrap in AuthProvider, add auth gating logic |
| `frontend/app/(auth)/login.tsx` | Replace email/password form with "Sign in with Microsoft" |
| `frontend/app/(auth)/_layout.tsx` | Remove signup screen reference |

### Deleted files
| File | Why |
|---|---|
| `frontend/app/(auth)/signup.tsx` | B2C's hosted page handles both sign up and sign in |

---

## Task 1: Create the feature branch

**Files:** none

- [ ] Create and switch to the feature branch:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/azure-b2c-auth
  ```

- [ ] Verify you're on the right branch:
  ```bash
  git branch
  ```
  Expected: `* feature/azure-b2c-auth` in the list

---

## Task 2: Azure B2C tenant setup (portal — no code)

This is all portal work. You'll collect values here that go into config files in later tasks. Keep them written down somewhere.

**What you're building:** Your own little Microsoft login system, scoped entirely to this app.

- [ ] **Create the B2C tenant**
  1. Go to [portal.azure.com](https://portal.azure.com)
  2. Search **"Azure AD B2C"** in the top search bar → click it
  3. Click **"Create a new Azure AD B2C Tenant"**
  4. Fill in:
     - Organization name: `LocationReviewApp`
     - Initial domain name: something short like `locationreviewapp` → becomes `locationreviewapp.onmicrosoft.com`
     - Country: yours
     - Subscription + Resource group: use whatever's available
  5. Click **Review + Create** → **Create**
  6. Wait ~1 minute

  > **What just happened?** You created a completely separate Azure directory just for your app's users. It's isolated from any org or school account — users sign up here with just an email.

- [ ] **Switch into the B2C tenant**
  1. After creation, click **"Click here to navigate to the new tenant"**
  2. Confirm you're in it — top right of the portal should show your B2C tenant name
  
  > Everything from here on must be done inside this B2C tenant, not your main Azure account.

- [ ] **Register the backend API app**

  The backend needs its own app registration so B2C knows which audience tokens should be validated against.

  1. Left sidebar → **App registrations** → **New registration**
  2. Fill in:
     - Name: `LocationReviewApp-Backend`
     - Supported account types: **"Accounts in any identity provider or organizational directory"**
     - Redirect URI: leave blank
  3. Click **Register**
  4. Copy and save the **Application (client) ID** → call this `BACKEND_CLIENT_ID`

  Now expose an API scope (what the frontend requests permission to call):

  5. Left sidebar → **Expose an API**
  6. Click **Add** next to "Application ID URI" → accept the default → **Save**
  7. Click **Add a scope**:
     - Scope name: `access_as_user`
     - Admin consent display name: `Access LocationReviewApp API`
     - Admin consent description: `Allows the app to call the API on behalf of the signed-in user`
     - State: **Enabled**
  8. Click **Add scope**
  9. Copy the full scope string: `api://<BACKEND_CLIENT_ID>/access_as_user` → save as `BACKEND_SCOPE`

- [ ] **Register the frontend mobile app**

  1. Left sidebar → **App registrations** → **New registration**
  2. Fill in:
     - Name: `LocationReviewApp-Mobile`
     - Supported account types: **"Accounts in any identity provider or organizational directory"**
     - Redirect URI: choose **Public client/native** from the dropdown, then enter:
       ```
       https://auth.expo.io/@<your-expo-username>/frontend
       ```
       > Your Expo username is the one you log into expo.dev with. The slug `frontend` comes from `frontend/app.json`.
  3. Click **Register**
  4. Copy the **Application (client) ID** → save as `FRONTEND_CLIENT_ID`

  Grant the frontend permission to call the backend scope:

  5. Left sidebar → **API permissions** → **Add a permission** → **My APIs** → **LocationReviewApp-Backend**
  6. Select `access_as_user` → **Add permissions**
  7. Click **Grant admin consent** → **Yes**

  Make it a public client (mobile apps can't keep secrets, so they don't use one):

  8. Left sidebar → **Authentication**
  9. Scroll to **Advanced settings** → set **"Allow public client flows"** to **Yes**
  10. Click **Save**

- [ ] **Create the Sign up and Sign in user flow**

  This is the actual Microsoft-hosted login page users will see.

  1. Left sidebar → **User flows** (under Policies) → **New user flow**
  2. Select **Sign up and sign in** → Version: **Recommended** → **Create**
  3. Fill in:
     - Name: `signupsignin` → Azure prefixes it → `B2C_1_signupsignin`
     - Identity providers: check **Email signup**
     - Multifactor authentication: **Disabled**
  4. Under **User attributes** (collected at signup): check **Display Name**, **Email Address**
  5. Under **Application claims** (what goes in the token): check **Display Name**, **Email Addresses**, **User's Object ID**
  6. Click **Create**

  > **What just happened?** You configured the Microsoft-hosted login page. When users sign up they'll enter their email, create a password, and type a display name. All of that gets baked into the JWT token the app receives after login.

- [ ] **Write down all your values**

  | Name | Where to find it | Example |
  |---|---|---|
  | `TENANT_NAME` | The domain prefix you chose | `locationreviewapp` |
  | `BACKEND_CLIENT_ID` | Backend app registration → Overview | `aaaaaaaa-bbbb-cccc-...` |
  | `FRONTEND_CLIENT_ID` | Frontend app registration → Overview | `cccccccc-dddd-eeee-...` |
  | `POLICY_NAME` | User flows list | `B2C_1_signupsignin` |
  | `BACKEND_SCOPE` | Backend app → Expose an API | `api://<BACKEND_CLIENT_ID>/access_as_user` |

  Your JWK set URI (used in the backend config) will be:
  ```
  https://<TENANT_NAME>.b2clogin.com/<TENANT_NAME>.onmicrosoft.com/<POLICY_NAME>/discovery/v2.0/keys
  ```

- [ ] **Verify the user flow works**
  1. In the portal, click on `B2C_1_signupsignin`
  2. Click **Run user flow** → select your frontend app → **Run user flow**
  3. A login page should open in a new tab
  4. Sign up with a test email address
  5. After signup you'll land on `jwt.ms` — this shows you the token your app will receive
  6. Find the `sub` claim — that's the Azure Object ID, the unique ID we'll store in our database
  7. Copy the `access_token` value — you'll paste it into Postman in Task 11

---

## Task 3: Database migration — add azure_oid column

**Files:**
- Create: `database/migrations/V002__users_add_azure_oid.sql`

- [ ] Create the file with this content:

  ```sql
  -- V002: Add azure_oid column to users table
  -- This links each user row to their Azure B2C identity.
  -- The backend reads the 'sub' claim from the JWT and looks up by this column.
  ALTER TABLE users ADD COLUMN azure_oid VARCHAR(255) UNIQUE;
  ```

- [ ] Run it against the Azure PostgreSQL database using your SQL client (DBeaver, psql, Azure Data Studio):

  ```sql
  -- Verify the column was added:
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'users' AND column_name = 'azure_oid';
  ```
  Expected: one row returned with `character varying`

- [ ] Commit:
  ```bash
  git add database/migrations/V002__users_add_azure_oid.sql
  git commit -m "db: add azure_oid column to users table"
  ```

---

## Task 4: Backend — add OAuth2 Resource Server dependency

**Files:**
- Modify: `backend/LocationReviewApp/pom.xml`

- [ ] Add this dependency inside `<dependencies>`, after the existing Security dependency:

  ```xml
  <!-- Azure B2C JWT validation -->
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
  </dependency>
  ```

  > **What this does:** Gives Spring Security the ability to understand and validate JWTs. Without it, Spring has no idea what a token even is. With it, you get automatic signature verification and `@AuthenticationPrincipal Jwt jwt` in your controllers.

- [ ] Verify it compiles:
  ```bash
  cd backend/LocationReviewApp
  .\mvnw.cmd compile    # Windows
  ./mvnw compile        # macOS/Linux
  ```
  Expected: `BUILD SUCCESS`

- [ ] Commit:
  ```bash
  git add backend/LocationReviewApp/pom.xml
  git commit -m "build: add spring-boot-starter-oauth2-resource-server"
  ```

---

## Task 5: Backend — update application.properties

**Files:**
- Modify: `backend/LocationReviewApp/src/main/resources/application.properties` (your local copy — never committed)
- Modify: `backend/LocationReviewApp/src/main/resources/application.properties-template`

- [ ] Add these lines to your local `application.properties` (fill in real values from Task 2):

  ```properties
  # Azure B2C — JWT token validation
  # Spring fetches the public keys from this URL on startup and uses them to verify every token
  spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://<TENANT_NAME>.b2clogin.com/<TENANT_NAME>.onmicrosoft.com/<POLICY_NAME>/discovery/v2.0/keys

  # The backend app's client ID — used to confirm the token was issued for our API
  azure.b2c.client-id=<BACKEND_CLIENT_ID>
  ```

- [ ] Add the same lines (with empty values) to `application.properties-template`:

  ```properties
  # Azure B2C — JWT token validation
  # Format: https://<TENANT_NAME>.b2clogin.com/<TENANT_NAME>.onmicrosoft.com/<POLICY_NAME>/discovery/v2.0/keys
  spring.security.oauth2.resourceserver.jwt.jwk-set-uri=

  # The backend app client ID from the Azure portal (LocationReviewApp-Backend app registration)
  azure.b2c.client-id=
  ```

- [ ] Commit the template only:
  ```bash
  git add backend/LocationReviewApp/src/main/resources/application.properties-template
  git commit -m "config: add Azure B2C properties to template"
  ```

---

## Task 6: Backend — add azureOid to User model and repository

**Files:**
- Modify: `backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/model/User.java`
- Modify: `backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/repository/UserRepository.java`

- [ ] In `User.java`, add the field after the `email` field:

  ```java
  // The user's Azure B2C Object ID — read from the 'sub' claim in their JWT token.
  // Set once on first login. Used to look up which DB user a token belongs to.
  @Column(unique = true)
  private String azureOid;
  ```

  And add getter/setter after the email getter/setter:

  ```java
  public String getAzureOid() { return azureOid; }
  public void setAzureOid(String azureOid) { this.azureOid = azureOid; }
  ```

- [ ] In `UserRepository.java`, add this method:

  ```java
  import java.util.Optional;

  // Spring reads this method name and generates: SELECT * FROM users WHERE azure_oid = ?
  // You never write the SQL yourself.
  Optional<User> findByAzureOid(String azureOid);
  ```

- [ ] Verify it compiles:
  ```bash
  .\mvnw.cmd compile    # Windows
  ./mvnw compile        # macOS/Linux
  ```
  Expected: `BUILD SUCCESS`

- [ ] Commit:
  ```bash
  git add backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/model/User.java
  git add backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/repository/UserRepository.java
  git commit -m "feat: add azureOid field to User model and findByAzureOid to repository"
  ```

---

## Task 7: Backend — replace SecurityConfig with JWT validation

**Files:**
- Modify: `backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/config/SecurityConfig.java`

- [ ] Replace the entire file contents with:

  ```java
  package com.example.LocationReviewApp.config;

  import org.springframework.beans.factory.annotation.Value;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.security.config.annotation.web.builders.HttpSecurity;
  import org.springframework.security.config.http.SessionCreationPolicy;
  import org.springframework.security.oauth2.core.OAuth2Error;
  import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
  import org.springframework.security.oauth2.jwt.JwtDecoder;
  import org.springframework.security.oauth2.jwt.JwtValidators;
  import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
  import org.springframework.security.web.SecurityFilterChain;
  import org.springframework.web.cors.CorsConfiguration;
  import org.springframework.web.cors.CorsConfigurationSource;
  import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

  import java.util.List;

  @Configuration
  public class SecurityConfig {

      // Pulled from application.properties — URL where Spring fetches B2C's public keys
      @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
      private String jwkSetUri;

      // The backend app's client ID — every token must be issued for this app
      @Value("${azure.b2c.client-id}")
      private String backendClientId;

      @Bean
      public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          http
              // No CSRF needed — stateless JWT API, no browser sessions
              .csrf(csrf -> csrf.disable())

              // No sessions — every request stands alone and is verified by its token
              .sessionManagement(session ->
                  session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

              // CORS — open for development (restrict before production)
              .cors(cors -> cors.configurationSource(corsConfigurationSource()))

              // Every request must have a valid JWT — no token = 401
              .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())

              // Tell Spring to look for JWT Bearer tokens
              .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));

          return http.build();
      }

      @Bean
      public JwtDecoder jwtDecoder() {
          // Build a decoder using B2C's public key endpoint
          NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

          // Validate the token was issued for our backend API specifically
          // (not just any app registered in B2C)
          decoder.setJwtValidator(token -> {
              if (token.getAudience().contains(backendClientId)) {
                  return OAuth2TokenValidatorResult.success();
              }
              return OAuth2TokenValidatorResult.failure(
                  new OAuth2Error("invalid_token", "Token was not issued for this API", null)
              );
          });

          return decoder;
      }

      @Bean
      public CorsConfigurationSource corsConfigurationSource() {
          CorsConfiguration config = new CorsConfiguration();
          config.setAllowedOriginPatterns(List.of("*"));
          config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
          config.setAllowedHeaders(List.of("*"));
          config.setAllowCredentials(true);

          UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
          source.registerCorsConfiguration("/**", config);
          return source;
      }
  }
  ```

  > **Learning moment:** `NimbusJwtDecoder.withJwkSetUri()` downloads B2C's public keys once on startup. Every time a request comes in, Spring uses those keys to mathematically verify the token's signature. If anyone tampers with the token, the math fails and they get a 401. You write zero verification logic — Spring handles all of it.

- [ ] Verify it compiles:
  ```bash
  .\mvnw.cmd compile
  ```
  Expected: `BUILD SUCCESS`

- [ ] Commit:
  ```bash
  git add backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/config/SecurityConfig.java
  git commit -m "feat: replace SecurityConfig with Azure B2C JWT validation"
  ```

---

## Task 8: Backend — test that unauthenticated requests return 401

**Files:**
- Create: `backend/LocationReviewApp/src/test/java/com/example/LocationReviewApp/config/SecurityConfigTest.java`

- [ ] Create `SecurityConfigTest.java`:

  ```java
  package com.example.LocationReviewApp.config;

  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.test.web.servlet.MockMvc;

  import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
  import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

  @SpringBootTest
  @AutoConfigureMockMvc
  class SecurityConfigTest {

      @Autowired
      private MockMvc mockMvc;

      @Test
      void requestWithoutToken_returns401() throws Exception {
          // Before this change, GET /users returned 200 with no token.
          // After this change, it must return 401.
          mockMvc.perform(get("/users"))
                 .andExpect(status().isUnauthorized());
      }
  }
  ```

- [ ] Run it:
  ```bash
  .\mvnw.cmd test -Dtest=SecurityConfigTest    # Windows
  ./mvnw test -Dtest=SecurityConfigTest        # macOS/Linux
  ```
  Expected: `BUILD SUCCESS`, 1 test passed

- [ ] Commit:
  ```bash
  git add backend/LocationReviewApp/src/test/java/com/example/LocationReviewApp/config/SecurityConfigTest.java
  git commit -m "test: verify unauthenticated requests return 401"
  ```

---

## Task 9: Backend — create AuthController

**Files:**
- Create: `backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/controller/AuthController.java`

- [ ] Create `AuthController.java`:

  ```java
  package com.example.LocationReviewApp.controller;

  import com.example.LocationReviewApp.model.User;
  import com.example.LocationReviewApp.repository.UserRepository;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.security.core.annotation.AuthenticationPrincipal;
  import org.springframework.security.oauth2.jwt.Jwt;
  import org.springframework.web.bind.annotation.PostMapping;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RestController;

  import java.util.List;

  @RestController
  @RequestMapping("/auth")
  public class AuthController {

      @Autowired
      private UserRepository userRepository;

      // POST /auth/me
      // The frontend calls this after every login.
      // Returns the existing user if they've logged in before.
      // Creates a new user row if it's their first time — then returns them.
      //
      // @AuthenticationPrincipal Jwt jwt is populated automatically by Spring Security
      // from the validated Bearer token in the request. No manual parsing needed.
      @PostMapping("/me")
      public User getOrCreateUser(@AuthenticationPrincipal Jwt jwt) {
          // 'sub' is the Azure Object ID — unique per B2C user, never changes
          String azureOid = jwt.getSubject();

          return userRepository.findByAzureOid(azureOid)
                  .orElseGet(() -> {
                      // First login — provision a new user row
                      User newUser = new User();
                      newUser.setAzureOid(azureOid);

                      // B2C returns emails as a list claim called "emails" (not "email")
                      // We handle both just in case
                      List<String> emails = jwt.getClaimAsStringList("emails");
                      String email = (emails != null && !emails.isEmpty())
                              ? emails.get(0)
                              : jwt.getClaimAsString("email");
                      newUser.setEmail(email != null ? email : azureOid + "@placeholder.com");

                      // Use the display name from the token, or fall back to the email prefix
                      String name = jwt.getClaimAsString("name");
                      String fallbackUsername = email != null
                              ? email.split("@")[0]
                              : azureOid.substring(0, 8);
                      newUser.setUsername(name != null ? name : fallbackUsername);

                      return userRepository.save(newUser);
                  });
      }
  }
  ```

  > **Learning moment:** `@AuthenticationPrincipal Jwt jwt` is the key annotation here. By the time this method runs, Spring Security has already verified the token's signature. You just read the claims — `jwt.getSubject()` gives you the `sub` claim (Azure OID), and `jwt.getClaimAsString("name")` gives you the display name the user typed at signup.

  > **Why "emails" is plural:** B2C returns email addresses in a claim called `emails` as a string array — even when there's only one. It's a B2C-specific quirk that catches people out.

- [ ] Compile:
  ```bash
  .\mvnw.cmd compile
  ```
  Expected: `BUILD SUCCESS`

- [ ] Commit:
  ```bash
  git add backend/LocationReviewApp/src/main/java/com/example/LocationReviewApp/controller/AuthController.java
  git commit -m "feat: add AuthController with POST /auth/me auto-provisioning"
  ```

---

## Task 10: Backend — write and run AuthController tests

**Files:**
- Create: `backend/LocationReviewApp/src/test/java/com/example/LocationReviewApp/controller/AuthControllerTest.java`

- [ ] Create `AuthControllerTest.java`:

  ```java
  package com.example.LocationReviewApp.controller;

  import com.example.LocationReviewApp.repository.UserRepository;
  import org.junit.jupiter.api.BeforeEach;
  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.test.web.servlet.MockMvc;

  import java.util.List;

  import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
  import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
  import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

  @SpringBootTest
  @AutoConfigureMockMvc
  class AuthControllerTest {

      @Autowired
      private MockMvc mockMvc;

      @Autowired
      private UserRepository userRepository;

      @BeforeEach
      void cleanUp() {
          // Remove test user before each test so they don't interfere with each other
          userRepository.findByAzureOid("test-oid-123")
                  .ifPresent(userRepository::delete);
      }

      @Test
      void postAuthMe_firstLogin_createsAndReturnsUser() throws Exception {
          // jwt() from spring-security-test creates a fake validated JWT.
          // No real B2C connection needed — we're testing our logic, not Azure's.
          mockMvc.perform(post("/auth/me")
                  .with(jwt().jwt(builder -> builder
                          .subject("test-oid-123")
                          .claim("emails", List.of("testuser@example.com"))
                          .claim("name", "Test User"))))
                  .andExpect(status().isOk())
                  .andExpect(jsonPath("$.azureOid").value("test-oid-123"))
                  .andExpect(jsonPath("$.email").value("testuser@example.com"))
                  .andExpect(jsonPath("$.username").value("Test User"));
      }

      @Test
      void postAuthMe_secondLogin_returnsExistingUser_notDuplicate() throws Exception {
          // First login — creates the user
          mockMvc.perform(post("/auth/me")
                  .with(jwt().jwt(builder -> builder
                          .subject("test-oid-123")
                          .claim("emails", List.of("testuser@example.com"))
                          .claim("name", "Test User"))))
                  .andExpect(status().isOk());

          // Second login with same OID — must return same user, not create a second row
          mockMvc.perform(post("/auth/me")
                  .with(jwt().jwt(builder -> builder
                          .subject("test-oid-123")
                          .claim("emails", List.of("testuser@example.com"))
                          .claim("name", "Test User"))))
                  .andExpect(status().isOk())
                  .andExpect(jsonPath("$.azureOid").value("test-oid-123"));

          long count = userRepository.findAll().stream()
                  .filter(u -> "test-oid-123".equals(u.getAzureOid()))
                  .count();
          assert count == 1 : "Expected exactly 1 user row — got " + count;
      }

      @Test
      void postAuthMe_withoutToken_returns401() throws Exception {
          mockMvc.perform(post("/auth/me"))
                  .andExpect(status().isUnauthorized());
      }
  }
  ```

  > **Learning moment:** `jwt()` from `spring-security-test` lets you inject a fake pre-validated JWT in tests. This means you can test your business logic (does auto-provisioning work?) without needing a live B2C connection. You test the real token validation manually with Postman in the next task.

- [ ] Run all backend tests:
  ```bash
  .\mvnw.cmd test    # Windows
  ./mvnw test        # macOS/Linux
  ```
  Expected: `BUILD SUCCESS`, all tests pass

- [ ] Commit:
  ```bash
  git add backend/LocationReviewApp/src/test/java/com/example/LocationReviewApp/controller/AuthControllerTest.java
  git commit -m "test: add AuthController tests for auto-provisioning and duplicate prevention"
  ```

---

## Task 11: Backend — manual verification with Postman

This confirms real B2C tokens work against the running backend.

- [ ] Start the backend:
  ```bash
  .\mvnw.cmd spring-boot:run    # Windows
  ./mvnw spring-boot:run        # macOS/Linux
  ```

- [ ] Get a real token from B2C:
  1. Azure portal → your B2C tenant → **User flows** → `B2C_1_signupsignin`
  2. Click **Run user flow** → select your frontend app → **Run user flow**
  3. Sign in with your test account
  4. You land on `jwt.ms` — copy the `access_token` value (the long string)

- [ ] **Test: no token → 401**
  ```
  GET http://localhost:8080/users
  ```
  Expected: `401 Unauthorized`

- [ ] **Test: real token → 200**
  ```
  GET http://localhost:8080/users
  Authorization: Bearer <paste your token here>
  ```
  Expected: `200 OK` with a JSON array of users

- [ ] **Test: POST /auth/me creates a user**
  ```
  POST http://localhost:8080/auth/me
  Authorization: Bearer <paste your token here>
  ```
  Expected: `200 OK` with a user object containing your `azureOid`, email, and username.
  Check the database — a new row should exist in the `users` table.

- [ ] **Test: POST /auth/me again returns same user (no duplicate)**
  Run user flow again, get a new token (access tokens expire), call POST /auth/me.
  Expected: same user returned, no second row in the database.

---

## Task 12: Frontend — install new packages

**Files:** `frontend/package.json` (updated by npm)

- [ ] Install the packages:
  ```bash
  cd frontend
  npx expo install expo-auth-session expo-crypto expo-secure-store
  ```

  > **What each one does:**
  > - `expo-auth-session` — opens the B2C login page and captures the redirect back to the app
  > - `expo-crypto` — provides crypto utilities for PKCE (a security mechanism that stops token theft during the browser redirect)
  > - `expo-secure-store` — encrypted storage on the device so the token persists between app opens (users don't log in every time)

- [ ] Verify the app still starts:
  ```bash
  npx expo start
  ```
  Expected: starts with no errors

- [ ] Commit:
  ```bash
  git add frontend/package.json frontend/package-lock.json
  git commit -m "build: install expo-auth-session, expo-crypto, expo-secure-store"
  ```

---

## Task 13: Frontend — create AuthContext

**Files:**
- Create: `frontend/context/AuthContext.tsx`

- [ ] Create the `context/` folder and `AuthContext.tsx`. Fill in your real values from Task 2 where indicated:

  ```typescript
  import React, { createContext, useContext, useEffect, useState } from "react";
  import * as AuthSession from "expo-auth-session";
  import * as WebBrowser from "expo-web-browser";
  import * as SecureStore from "expo-secure-store";

  // Required for Android — closes the browser tab after the redirect back to the app
  WebBrowser.maybeCompleteAuthSession();

  // ── Fill in your values from Task 2 ──────────────────────────────────────────
  const TENANT_NAME = "<TENANT_NAME>";           // e.g. "locationreviewapp"
  const POLICY_NAME = "B2C_1_signupsignin";
  const FRONTEND_CLIENT_ID = "<FRONTEND_CLIENT_ID>";
  const BACKEND_CLIENT_ID = "<BACKEND_CLIENT_ID>";
  export const API_URL = "http://localhost:8080"; // update to deployed URL when live
  // ─────────────────────────────────────────────────────────────────────────────

  const BACKEND_SCOPE = `api://${BACKEND_CLIENT_ID}/access_as_user`;

  const discovery = {
    authorizationEndpoint: `https://${TENANT_NAME}.b2clogin.com/${TENANT_NAME}.onmicrosoft.com/${POLICY_NAME}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://${TENANT_NAME}.b2clogin.com/${TENANT_NAME}.onmicrosoft.com/${POLICY_NAME}/oauth2/v2.0/token`,
    endSessionEndpoint: `https://${TENANT_NAME}.b2clogin.com/${TENANT_NAME}.onmicrosoft.com/${POLICY_NAME}/oauth2/v2.0/logout`,
  };

  const TOKEN_KEY = "auth_token";

  export type DbUser = {
    id: string;
    username: string;
    email: string;
    bio: string | null;
    profilePic: string | null;
    createdAt: string;
  };

  type AuthContextType = {
    token: string | null;
    user: DbUser | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
  };

  const AuthContext = createContext<AuthContextType | null>(null);

  export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<DbUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const redirectUri = AuthSession.makeRedirectUri({ scheme: "frontend" });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: FRONTEND_CLIENT_ID,
        scopes: ["openid", "offline_access", BACKEND_SCOPE],
        redirectUri,
        usePKCE: true,
      },
      discovery
    );

    // On app startup: check SecureStore for a saved token and restore the session
    useEffect(() => {
      async function restoreSession() {
        try {
          const saved = await SecureStore.getItemAsync(TOKEN_KEY);
          if (saved) {
            const dbUser = await fetchDbUser(saved);
            if (dbUser) {
              setToken(saved);
              setUser(dbUser);
            } else {
              // Token was invalid or expired — clear it so the user sees the login screen
              await SecureStore.deleteItemAsync(TOKEN_KEY);
            }
          }
        } catch {
          // Ignore errors on restore — user will just log in again
        } finally {
          setIsLoading(false);
        }
      }
      restoreSession();
    }, []);

    // When B2C redirects back to the app with an authorization code, exchange it for a token
    useEffect(() => {
      if (response?.type === "success") {
        handleAuthResponse(response.params.code);
      }
    }, [response]);

    async function handleAuthResponse(code: string) {
      try {
        // Exchange the authorization code for an access token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: FRONTEND_CLIENT_ID,
            code,
            redirectUri,
            extraParams: { code_verifier: request!.codeVerifier! },
          },
          discovery
        );

        const accessToken = tokenResponse.accessToken;

        // Resolve our database user (creates them on first login)
        const dbUser = await fetchDbUser(accessToken);
        if (!dbUser) throw new Error("Failed to resolve database user after login");

        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        setToken(accessToken);
        setUser(dbUser);
      } catch (e) {
        console.error("Auth error:", e);
      }
    }

    async function fetchDbUser(accessToken: string): Promise<DbUser | null> {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    }

    async function login() {
      await promptAsync();
    }

    async function logout() {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }

    return (
      <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Hook — any screen can call useAuth() to get token, user, login, logout, isLoading
  export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be called inside AuthProvider");
    return ctx;
  }
  ```

  > **Learning moment — why a Context?** Without it you'd have to pass `token` and `user` down through every screen as props, which gets messy fast. The `AuthProvider` wraps the whole app and makes these values available to any screen that calls `useAuth()`. It's like a global store for auth state.

  > **Learning moment — what PKCE does:** When the app redirects to B2C and back, the authorization code briefly appears in the URL. PKCE (Proof Key for Code Exchange) prevents anyone from stealing that code. The app generates a random secret, sends its hash to B2C, and proves it knows the original when exchanging the code for a token. This is standard practice for all mobile apps.

- [ ] Commit:
  ```bash
  git add frontend/context/AuthContext.tsx
  git commit -m "feat: add AuthContext with B2C login/logout and session persistence"
  ```

---

## Task 14: Frontend — create shared API utility

**Files:**
- Create: `frontend/utils/api.ts`

- [ ] Create the `utils/` folder and `api.ts`:

  ```typescript
  // Shared fetch helper — automatically attaches the Bearer token to every API request.
  //
  // Usage in any screen:
  //   const { token } = useAuth();
  //   const res = await apiFetch(token, "/locations");
  //   const locations = await res.json();

  import { API_URL } from "@/context/AuthContext";

  export async function apiFetch(
    token: string | null,
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  }
  ```

  > **Why this exists:** Every future screen that calls the backend just does `apiFetch(token, "/whatever")` instead of manually writing the Authorization header every time. If the token format ever changes, there's one place to update.

- [ ] Commit:
  ```bash
  git add frontend/utils/api.ts
  git commit -m "feat: add apiFetch utility with automatic Authorization header"
  ```

---

## Task 15: Frontend — update root layout with auth gating

**Files:**
- Modify: `frontend/app/_layout.tsx`

- [ ] Replace the entire contents of `_layout.tsx` with:

  ```typescript
  import { Stack } from "expo-router";
  import { router } from "expo-router";
  import { StatusBar } from "expo-status-bar";
  import "react-native-reanimated";
  import { SafeAreaProvider } from "react-native-safe-area-context";
  import { useEffect } from "react";
  import { View, ActivityIndicator } from "react-native";
  import { AuthProvider, useAuth } from "@/context/AuthContext";

  // This component sits inside AuthProvider so it can call useAuth()
  function RootNavigator() {
    const { user, isLoading } = useAuth();

    useEffect(() => {
      if (isLoading) return;
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }, [user, isLoading]);

    // Show a spinner while checking if the user already has a saved session
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  }

  export default function RootLayout() {
    return (
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    );
  }
  ```

  > **Learning moment — why two components?** `useAuth()` can only be called inside a component that lives inside `<AuthProvider>`. If we called it directly in `RootLayout`, the provider wouldn't exist yet. So `RootLayout` sets up the provider, and `RootNavigator` (which lives inside it) reads from it. This is a common React pattern.

- [ ] Commit:
  ```bash
  git add frontend/app/_layout.tsx
  git commit -m "feat: add AuthProvider and auth gating to root layout"
  ```

---

## Task 16: Frontend — replace login screen

**Files:**
- Modify: `frontend/app/(auth)/login.tsx`

- [ ] Replace the entire contents of `login.tsx` with:

  ```typescript
  import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
  import { useState } from "react";
  import { useAuth } from "@/context/AuthContext";
  import ScreenWrapper from "@/components/ScreenWrapper";

  export default function LoginScreen() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
      setLoading(true);
      try {
        await login();
      } finally {
        setLoading(false);
      }
    }

    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to discover places near you</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in with Microsoft</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: "#666",
      marginBottom: 48,
      textAlign: "center",
    },
    button: {
      backgroundColor: "#0078D4",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
  ```

  > `#0078D4` is Microsoft's brand blue. The email/password fields are gone entirely — Microsoft's hosted B2C page handles all of that.

- [ ] Commit:
  ```bash
  git add frontend/app/(auth)/login.tsx
  git commit -m "feat: replace login screen with Sign in with Microsoft button"
  ```

---

## Task 17: Frontend — remove signup screen

**Files:**
- Delete: `frontend/app/(auth)/signup.tsx`
- Modify: `frontend/app/(auth)/_layout.tsx`

- [ ] Delete the signup screen:
  ```bash
  git rm frontend/app/(auth)/signup.tsx
  ```

- [ ] Update `frontend/app/(auth)/_layout.tsx` to remove the signup reference:

  ```typescript
  import { Stack } from "expo-router";

  export default function AuthLayout() {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    );
  }
  ```

- [ ] Commit:
  ```bash
  git add frontend/app/(auth)/_layout.tsx
  git commit -m "feat: remove signup screen — B2C hosts signup and login together"
  ```

---

## Task 18: Full integration test

- [ ] Start the backend:
  ```bash
  cd backend/LocationReviewApp
  .\mvnw.cmd spring-boot:run
  ```

- [ ] Start the frontend:
  ```bash
  cd frontend
  npx expo start
  ```

- [ ] Open the app. Confirm:
  - Loading spinner appears briefly
  - You are redirected to the login screen (not logged in yet)
  - Only a "Sign in with Microsoft" button is shown — no email/password fields

- [ ] Tap "Sign in with Microsoft". Confirm:
  - A browser opens with the Microsoft B2C login page
  - You can sign up with a new email, or sign in with your test account from Task 2
  - After login you are redirected back to the app automatically
  - You land on the tabs (home screen)

- [ ] Check the database. Confirm a new row exists in `users` with:
  - `azure_oid` set to your B2C Object ID
  - `email` matching what you signed up with
  - `username` matching the display name you entered

- [ ] Close and reopen the app. Confirm:
  - You go straight to the tabs (session restored from SecureStore)
  - Login screen does not appear

- [ ] Test logout — temporarily add a logout button to the profile screen:
  ```typescript
  // In frontend/app/(tabs)/profile.tsx — add these two lines for testing
  import { useAuth } from "@/context/AuthContext";
  import { Button } from "react-native";

  // Inside the component:
  const { logout } = useAuth();
  // Inside the return JSX, add:
  // <Button title="Logout" onPress={logout} />
  ```
  Confirm: tapping Logout returns you to the login screen and clears the session.

---

## Task 19: Push the branch

- [ ] Push to GitHub:
  ```bash
  git push -u origin feature/azure-b2c-auth
  ```

- [ ] Open a pull request on GitHub when the team is ready to review.
