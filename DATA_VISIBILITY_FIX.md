# VibeHQ data visibility fix

The app now:
- reads posts without Firestore `orderBy`, so older posts missing `created_date` are not silently excluded;
- reads all signed-in-visible member records from `users`;
- merges `users` and `profiles` so older accounts appear in Search;
- keeps post ownership based on `created_by_id`;
- requires the updated Firestore rules below to be deployed.

Deploy rules with Firebase CLI from this App directory:
`firebase deploy --only firestore:rules`

If Render builds from this repository, commit these changes and redeploy the service.
