# VibeHQ Firebase setup

1. In Firebase Console, open your VibeHQ project.
2. Go to Project settings -> Your apps -> Web app. Create a Web app if you have not already.
3. Copy the Firebase Web SDK configuration values into `.env.local` using `.env.example`.
4. In Authentication -> Sign-in method, enable:
   - Email/Password
   - Google (optional, if you want the Google button)
5. Create/enable Firestore Database.
6. Create/enable Storage if you want photo uploads.
7. Apply `firestore.rules` and `storage.rules` in the Firebase console or through the Firebase CLI.
8. Add your local development host (for example `localhost`) under Authentication -> Settings -> Authorized domains if it is not already present.

The app now uses Firebase Authentication for account creation, login, Google sign-in, password reset, persistent sessions, and account deletion. Firestore replaces the previous Base44 entity calls through `src/api/base44Client.js` so the rest of the VibeHQ UI can continue using the same data API while the backend is migrated.
