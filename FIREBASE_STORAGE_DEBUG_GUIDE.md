# Firebase Storage Upload Debug Guide

## Current Status
✅ Firebase Storage upload logic rebuilt with `uploadBytesResumable`
✅ Comprehensive console logging added at every step
✅ Fully permissive temporary storage rules provided
✅ Frontend builds successfully

## What Changed
1. **firebase.js** - Fixed `storageBucket` to "roadsos-c990a.appspot.com"
2. **firebase.storage.rules** - Fully permissive rules (if true) for debugging
3. **authService.js** - Complete rewrite of `uploadVerificationFile()` with:
   - Auth validation before upload
   - `uploadBytesResumable` with progress callbacks
   - Detailed error logging with error codes
   - Full retry path in `registerUser()` with auth cleanup
4. **RegisterScreen.jsx** - Added progress tracking logs

## Step-by-Step Debugging

### STEP 1: Deploy Storage Rules to Firebase
```bash
firebase deploy --only storage
```
Or manually in Firebase Console:
1. Go to **Build → Storage → Rules**
2. Replace with this:
```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **Publish**

### STEP 2: Test in Browser
1. Open your app
2. Navigate to Register
3. Choose a role (helper, police, hospital, or fire)
4. Select a verification file
5. **Open Browser Console** (F12 → Console tab)
6. Click "Create account"

### STEP 3: Read Console Logs
You will see logs like:
```
Selected file: document.pdf size: 245000 type: application/pdf
Auth check passed, user uid: abc123def456
Starting upload for folder: idProof
Storage path: verificationDocs/abc123def456/idProof/1716501234567-document.pdf
Created file ref
Starting uploadBytesResumable
Upload progress: 10 %
Upload progress: 25 %
Upload progress: 50 %
Upload progress: 75 %
Upload progress: 100 %
Upload completed, getting download URL
UPLOAD SUCCESS: https://firebasestorage.googleapis.com/v0/b/...
```

### STEP 4: If Upload Fails
You will see error logs like:
```
UPLOAD ERROR: storage/unauthorized
Authorization error details: User is not authorized to access this resource
```

Common errors:
- **storage/unauthorized** → Rules issue (Step 1 not completed)
- **storage/invalid-root-path** → storageBucket incorrect
- **storage/retry-limit-exceeded** → Network issue
- **auth/user-not-found** → Auth session lost

### STEP 5: Expected Console Output

**Successful Upload:**
```
RegisterScreen: handleSubmit starting, role: helper
RegisterScreen: calling onRegister
Selected file: profile.jpg size: 125000 type: image/jpeg
Auth check passed, user uid: user123
Starting upload for folder: selfie
Upload progress: 20 %
Upload progress: 60 %
Upload progress: 100 %
Upload completed, getting download URL
UPLOAD SUCCESS: https://firebasestorage.googleapis.com/v0/b/roadsos-c990a.appspot.com/o/...
registerUser: selfie uploaded successfully
RegisterScreen: onRegister completed successfully
RegisterScreen: handleSubmit finally, isLoading set to false
```

**Failed Upload:**
```
RegisterScreen: handleSubmit starting, role: helper
RegisterScreen: calling onRegister
Selected file: profile.jpg
UPLOAD ERROR: storage/unauthorized
User is not authorized to access this resource
registerUser: upload FAILED User is not authorized to access this resource
RegisterScreen: handleSubmit finally, isLoading set to false
```

### STEP 6: Verify Button States
Watch the button during upload:
1. Should show "Uploading 10%"
2. Progress should increment to 100%
3. Button should re-enable after completion/error
4. On success: redirect to dashboard
5. On error: red error box appears, button re-enables

### STEP 7: Firebase Console Verification
1. Go to Firebase Console → Storage
2. Check if files appear in `verificationDocs/` folder
3. Verify path structure: `verificationDocs/{userId}/{folder}/{timestamp}-{filename}`

## If Upload Still Stuck at 20%
1. Check if Rules deployed (Step 1)
2. Clear browser cache and localStorage:
   ```javascript
   // Run in browser console
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```
3. Check storageBucket in firebase.js:
   ```javascript
   // Run in browser console
   import { storage } from './firebase.js';
   console.log('Storage ref:', storage);
   ```
4. Verify auth is working:
   ```javascript
   import { auth } from './firebase.js';
   console.log('Current user:', auth.currentUser);
   ```

## Checklist Before Testing
- [ ] firebase.storage.rules deployed to Firebase Console
- [ ] firebase.js has correct storageBucket format (.appspot.com)
- [ ] Browser console open (F12)
- [ ] Cleared cache/localStorage
- [ ] Using Chrome/Firefox/Edge (not IE11)
- [ ] Network connection stable

## What Should NOT Happen
- ❌ Button stuck at "Uploading 20%"
- ❌ Silent failure (no console error)
- ❌ Infinite loading spinner
- ❌ No progress updates

## Next Steps If Debugging Fails
1. Share console error messages (screenshot/text)
2. Share Firebase project ID: `roadsos-c990a`
3. Check if Firebase Storage exists in Console (should show "verificationDocs" folder)
4. Verify Firebase project has Storage enabled (not just Firestore/Auth)
