# Auth Setup — Fix the Redirect URI Error

If you're getting a **"redirect URI mismatch"** when trying to log in, this will fix it.

Azure needs to know the exact address it's allowed to redirect you back to after login. That address includes your machine's IP, so it's different for everyone and needs to be added manually.

---

## What to send Felix

Just drop these two things in the group chat:

1. **Your local IP address** (how to find it below)
2. **Your Expo username** — the `@handle` you use on Expo Go / expo.dev

---

## Finding your local IP

Make sure you're on Wi-Fi first.

**Windows:**
1. Open Command Prompt → type `ipconfig` → hit Enter
2. Look under **"Wireless LAN adapter Wi-Fi"** for **IPv4 Address**
3. Should look like `192.168.1.72`

**Mac:**
1. Open Terminal → type `ifconfig` → hit Enter
2. Look under `en0` for the line starting with `inet`
3. Should look like `192.168.1.72`

---

## Finding your Expo username

- Log in at [expo.dev](https://expo.dev) — username is in the top right
- Or open Expo Go on your phone — it shows at the top when signed in

---

## What gets added for each person

Two URIs per person — both needed to cover different ways of running the app:

| Type | Format | Used when |
|------|--------|-----------|
| Local | `exp://YOUR_IP:8081` | Running on local network |
| Proxy | `https://auth.expo.io/@YOUR_USERNAME/frontend` | Running via tunnel, or if local doesn't work |

---

## Adding them in Azure (Felix)

1. [portal.azure.com](https://portal.azure.com) → **App registrations** → **`LocationReviewApp-Mobile`** → **Authentication**

**Local URI** → scroll to **"Mobile and desktop applications"** → Add URI → `exp://THEIR_IP:8081`

**Proxy URI** → scroll to **"Web"** → Add URI → `https://auth.expo.io/@THEIR_USERNAME/frontend`

2. Hit **Save** — they can log in straight away, no restarts needed

---

## Current status

| Person | Local URI | Proxy URI |
|--------|-----------|-----------|
| Felix | ✅ `exp://192.168.1.51:8081` | ⏳ |
| Joye | ⏳ need IP | ✅ `https://auth.expo.io/@joyezhang/frontend` |
| Joel | ⏳ | ⏳ |
| Hamed | ⏳ | ⏳ |
| Jack James | ⏳ | ⏳ |
| Jack Duffin | ⏳ | ⏳ |

---

## A few things to know

- **IP can change** if you reconnect to Wi-Fi or switch networks — if login breaks randomly, that's probably why, just send the new one
- **Same Wi-Fi required** for the local URI — phone and laptop need to be on the same network. If they're not, run `npx expo start --tunnel` and use the proxy URI instead
