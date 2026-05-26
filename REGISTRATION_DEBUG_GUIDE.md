# Registration Flow Debug Guide

## Build Status
✅ Frontend builds successfully with comprehensive debug logging

## What Changed
1. **RegisterScreen.jsx** - Added detailed logging to handleNext and handleSubmit
   - Button click logs step and loading state
   - Form validation logs which field is missing
   - Upload and registration progress logged at each step
   - Alerts shown for validation errors and registration errors

2. **App.jsx** - Enhanced handleRegister with step-by-step logging
   - Logs form data received
   - Logs registerUser response
   - Logs profile setting and navigation

3. **authService.js** - Full registration flow logging
   - Firebase auth creation logged
   - Upload operations logged
   - Firestore saves logged (users and responders collections)
   - Error codes and messages logged

## How to Test

### STEP 1: Open Browser Console
1. Open your app in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Clear it (Optional: right-click → Clear)

### STEP 2: Navigate to Register
1. Click "Create account" or go to /register
2. You should see NO logs yet

### STEP 3: Fill Step 1 (Basic Info)
- Full name, Phone, Email, Password
- Click "Continue"

**Expected console logs:**
```
handleNext called, current step: 1 form data role: user
Moving to next step 2
```

### STEP 4: Fill Step 2 (Health Info)
- Blood group, optional medical info
- Enable location access
- Click "Continue"

**Expected console logs:**
```
handleNext called, current step: 2 form data role: user
Moving to next step 3
```

### STEP 5: Fill Step 3 (Role Selection)
1. Select a role: **Helper** (easiest for testing with file upload)
2. Upload selfie/photo
3. Upload verification document (ID)

**Expected console logs:**
```
handleNext called, current step: 3 form data role: helper
Button clicked, step: 3 isLoading: false
Step 3 reached, calling handleSubmit
=== REGISTER STARTED ===
Form data: {...formData with role: helper...}
Selected role: helper
Validation passed, starting registration
RegisterScreen: calling onRegister with form data
Role: helper
Email: your@email.com
Has selfie file: true
Has id proof file: true
```

### STEP 6: Click "Create Account" Button

**You should see these logs in sequence:**

```
Button clicked, step: 3 isLoading: false
Step 3 reached, calling handleSubmit

=== REGISTER STARTED ===
Form data: {...}
Selected role: helper
Validation passed, starting registration
RegisterScreen: calling onRegister with form data
Role: helper
Email: test@example.com
Has selfie file: true
Has id proof file: true

=== APP REGISTER HANDLER ===
Form data received: {...}
Calling registerUser from authService

=== REGISTER USER SERVICE ===
Form data: {...}
Creating Firebase auth user, email: test@example.com role: helper
Persistence set
Firebase Auth Success, uid: abc123def456

registerUser: uploading selfie file
Selected file: profile.jpg size: 125000 type: image/jpeg
Auth check passed, user uid: abc123def456
Starting upload for folder: selfie
Upload progress: 10 %
Upload progress: 50 %
Upload progress: 100 %
Upload completed, getting download URL
UPLOAD SUCCESS: https://firebasestorage.googleapis.com/v0/b/...
registerUser: selfie uploaded successfully https://...

registerUser: uploading id proof file
Selected file: id.pdf size: 245000 type: application/pdf
Auth check passed, user uid: abc123def456
Starting upload for folder: idProof
Upload progress: 10 %
Upload progress: 50 %
Upload progress: 100 %
Upload completed, getting download URL
UPLOAD SUCCESS: https://firebasestorage.googleapis.com/v0/b/...
registerUser: id proof uploaded successfully https://...

Saving user profile to Firestore, uid: abc123def456
User profile saved to Firestore
Creating responder document for role: helper
Responder document created

=== REGISTER USER SUCCESS ===
Returning profile

registerUser returned profile: {...}
Setting profile in context
Effective role: helper
Navigating to: /dashboard/helper

=== REGISTER SUCCESS ===
RegisterScreen: onRegister completed successfully
Account created successfully!
RegisterScreen: handleSubmit finally block
Button clicked... [cycle repeats]
```

Then you should be redirected to the Helper dashboard.

## If Registration Fails

### Scenario 1: Button Click Doesn't Work
**Console logs to look for:**
```
Button clicked, step: 3 isLoading: false
```

If you don't see this log:
- Button click handler not wired up
- Try clicking the button again
- Check if button is disabled (grayed out)

### Scenario 2: Form Validation Error
**Console logs:**
```
=== REGISTER STARTED ===
Validation error: [field name] is required
```

**Possible errors:**
- "Full name is required"
- "Phone is required"
- "Email is required"
- "Password must be at least 6 characters"
- "Enter a valid email address"
- "Enter a valid phone number"

**Fix:** Go back to previous step and fill missing fields

### Scenario 3: Firebase Auth Fails
**Console logs:**
```
Creating Firebase auth user, email: test@example.com role: helper
[ERROR] Firebase Auth Error
Error code: auth/email-already-in-use
```

**Common errors:**
- `auth/email-already-in-use` → Email already registered, use different email
- `auth/weak-password` → Password too short
- `auth/invalid-email` → Invalid email format
- `auth/network-request-failed` → Network connection issue

### Scenario 4: Upload Fails
**Console logs:**
```
registerUser: uploading selfie file
Selected file: profile.jpg size: 125000 type: image/jpeg
UPLOAD ERROR: storage/unauthorized
User is not authorized to access this resource

registerUser: upload FAILED User is not authorized to access this resource
registerUser: deleting auth user after upload failure
registerUser: auth user deleted

=== REGISTER USER ERROR ===
Error code: storage/unauthorized
```

**Fix:** Deploy Firebase Storage rules
```bash
firebase deploy --only storage
```

Or manually update rules in Firebase Console → Storage → Rules:
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

### Scenario 5: Firestore Save Fails
**Console logs:**
```
Saving user profile to Firestore, uid: abc123def456
[ERROR] Firestore error
Error code: permission-denied
```

**Fix:** Update Firestore rules in Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Button States During Registration

### Before Clicking
- Text: **"Create account"** (on step 3)
- Not disabled
- Clickable

### During Upload
- Text: **"Uploading 10%"** → **"Uploading 100%"**
- Disabled (grayed out)
- Not clickable

### During Firestore Save
- Text: **"Creating account..."**
- Disabled (grayed out)
- Not clickable

### On Success
- Redirected to dashboard
- No more button visible

### On Error
- Text: **"Create account"** (reset)
- Not disabled
- Clickable again
- Red error box appears with error message

## Firestore Verification

After successful registration, check Firebase Console:
1. Go to **Firestore** → **Collections**
2. You should see **users** collection with documents
3. Each document should have:
   - uid (user ID)
   - email
   - role (helper/police/hospital/fire/user)
   - fullName
   - phone
   - selfieUrl (for responders)
   - idProofUrl (for responders)
   - createdAt timestamp

For responders, also check:
4. **responders** collection
   - Each responder role document should exist
   - Should have verification status: "pending_verification"

## Common Issues & Solutions

| Issue | Logs to Check | Solution |
|-------|---------------|----------|
| Button doesn't respond | No "Button clicked" log | Refresh page, check if button is disabled |
| Stuck at "Uploading 20%" | No progress updates past 20% | Deploy Storage rules, check network |
| Validation errors appear | See error in "Validation error:" log | Fill missing required fields |
| Auth fails with code error | See "Error code: auth/..." | Check email/password, may be duplicate |
| No Firestore save log | Stops at "Saving user profile..." | Check Firestore rules, network |
| Redirect doesn't happen | Logs say "Navigating to: /..." but no redirect | Browser navigation might be blocked |

## Next Steps If Still Stuck

1. Copy entire console output (Ctrl+A → Ctrl+C)
2. Share with developer
3. Include:
   - Browser type and version
   - Network tab (check for failed requests)
   - Firestore rules currently deployed
   - Storage rules currently deployed
   - Form data you were registering with
