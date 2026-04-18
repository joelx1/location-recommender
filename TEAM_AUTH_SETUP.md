# Getting Logged In — Auth Setup for the Team

Hey everyone, Felix here. If you're getting a **"redirect URI mismatch"** error when trying to log in, this guide will fix it. It takes about 2 minutes once you know what to grab.

Quick background: our login goes through Microsoft Azure, and Azure needs to know the exact address it's allowed to redirect you back to after you log in. That address is different for everyone because it includes your machine's IP address and your Expo account. So I need to add yours manually in the Azure portal.

---

## What you need to send me

Just send me these two things in our group chat and I'll sort it out:

1. **Your local IP address** (instructions below)
2. **Your Expo username** — the one you use to log in to Expo Go / the Expo website

Once I have those I can add both your URIs and you'll be good to go.

---

## How to find your local IP

You need to be connected to Wi-Fi (same network as where you run the backend).

**Windows:**
1. Open Command Prompt (search "cmd" in the start menu)
2. Type `ipconfig` and hit Enter
3. Look for **"Wireless LAN adapter Wi-Fi"** and find the **IPv4 Address**
4. It'll look something like `192.168.1.72`

**Mac:**
1. Open Terminal
2. Type `ifconfig` and hit Enter
3. Look for `en0` and find the line starting with `inet`
4. It'll look something like `192.168.1.72`

---

## How to find your Expo username

- Go to [expo.dev](https://expo.dev) and sign in
- Your username is in the top right — it's the `@handle` under your name
- Or open Expo Go on your phone → it shows your username at the top when you're logged in

---

## What I'll add for you (Felix does this part)

Once you send me your IP and Expo username, I'll add two redirect URIs to Azure for you:

| Type | What it looks like | Used when |
|------|--------------------|-----------|
| Local | `exp://YOUR_IP:8081` | Running the app directly on your local network |
| Proxy | `https://auth.expo.io/@YOUR_EXPO_USERNAME/frontend` | Running via Expo tunnel or if local doesn't work |

Having both means you're covered no matter how you're running the app.

---

## How to add them in Azure (Felix's instructions to himself)

1. Go to [portal.azure.com](https://portal.azure.com) and sign in
2. Search **"App registrations"** → open **`LocationReviewApp-Mobile`**
3. Left sidebar → click **"Authentication"**

**For the local URI** (`exp://IP:8081`):
- Scroll to **"Mobile and desktop applications"**
- Click **Add URI** → paste `exp://THEIR_IP:8081`

**For the proxy URI** (`https://auth.expo.io/@username/frontend`):
- Scroll to **"Web"**
- Click **Add URI** → paste `https://auth.expo.io/@THEIR_EXPO_USERNAME/frontend`

4. Click **Save** at the top — done, they can log in immediately

---

## Current status

| Person | Local URI added | Proxy URI added |
|--------|----------------|-----------------|
| Felix | ✅ `exp://192.168.1.51:8081` | ⏳ need to add |
| Joye | ⏳ need IP | ✅ `https://auth.expo.io/@joyezhang/frontend` |
| Joel | ⏳ need IP + Expo username | ⏳ need IP + Expo username |
| Hamed | ⏳ need IP + Expo username | ⏳ need IP + Expo username |
| Jack James | ⏳ need IP + Expo username | ⏳ need IP + Expo username |
| Jack Duffin | ⏳ need IP + Expo username | ⏳ need IP + Expo username |

---

## Things to keep in mind

- **Your IP can change** if you reconnect to Wi-Fi or switch networks — if login suddenly stops working, check if your IP changed and let me know the new one
- **You don't need to restart the app** after I add your URI — it works immediately
- **Both need to be on the same Wi-Fi** — your phone and your laptop need to be on the same network for the local URI to work. If you're on different networks, use the proxy URI approach instead (run `npx expo start --tunnel`)

---

Any issues just ping me 👍
