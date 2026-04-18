# Fix the Login Error

If you're seeing a **redirect URI mismatch** when you try to log in, that's because Azure doesn't recognise your device yet. I need to add you manually, it only takes a second.

Send me your **local IP** and **Expo username** in the group chat and I'll get it sorted.

---

## How to find your IP

**Windows:**
1. Open Command Prompt, type `ipconfig`, hit Enter
2. Find **"Wireless LAN adapter Wi-Fi"** and look for **IPv4 Address**
3. It'll be something like `192.168.1.72`

**Mac:**
1. Open Terminal, type `ifconfig`, hit Enter
2. Find `en0` and look for the line starting with `inet`
3. Same deal, something like `192.168.1.72`

---

## How to find your Expo username

Go to [expo.dev](https://expo.dev) and sign in — your username is in the top right corner. Or just open Expo Go on your phone, it shows at the top.

---

## What I'm adding for each of you

Two things per person so you're covered either way:

| | Format |
|-|--------|
| Local | `exp://YOUR_IP:8081` |
| Proxy | `https://auth.expo.io/@YOUR_EXPO_USERNAME/frontend` |

---

## Status

| Person | Local | Proxy |
|--------|-------|-------|
| Felix | ✅ | ⏳ |
| Joye | ⏳ need IP | ✅ |
| Joel | ⏳ | ⏳ |
| Hamed | ⏳ | ⏳ |
| Jack James | ⏳ | ⏳ |
| Jack Duffin | ⏳ | ⏳ |

---

## Heads up

- Your IP can change if you switch networks or reconnect — if login randomly breaks again just send me the new one
- Your phone and laptop need to be on the same Wi-Fi for the local one to work. If they're not, run `npx expo start --tunnel` instead
