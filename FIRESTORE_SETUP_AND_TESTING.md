# Firestore Connection Fix & Setup Guide

## Build Status
✅ Frontend builds successfully - timeout wrappers removed, clean Firestore operations

## What Changed

### 1. authService.js
- Removed timeout wrappers around Firestore writes
- Replaced `serverTimestamp()` with ISO strings (`new Date().toISOString()`)
- Added `testFirestoreConnection()` function to diagnose connection issues
- Kept all error logging and step tracking

### 2. RegisterScreen.jsx
- Removed 60-second timeout wrapper
- Simplified to clean error handling
- Kept all console logging with [UI] prefix

### 3. App.jsx
- Removed timeout wrapper around registerUser call
- Simplified to clean error handling
- Kept all console logging

## CRITICAL: Firebase Console Setup

### Step 1: Create Firestore Database

1. Open **Firebase Console** → `roadsos-c990a`
2. Go to **Build** → **Firestore Database**
3. If not created, click **Create Database**
4. Choose:
   - **Start in Test Mode** (for development)
   - **Nearest Region** (usually your country/continent)
   - Click **Create**

### Step 2: Deploy Firestore Rules

1. In Firestore, click **Rules** tab
2. Replace ALL content with:
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
3. Click **Publish**

### Step 3: Deploy Storage Rules

1. Go to **Build** → **Storage**
2. Click **Rules** tab
3. Replace ALL content with:
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
4. Click **Publish**

### Step 4: Verify firebase.js Configuration

Check `frontend/src/firebase.js`:
```javascript
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnb2SEdxod5cDa2AGIRDP9NijLUZucZFY",
  authDomain: "roadsos-c990a.firebaseapp.com",
  projectId: "roadsos-c990a",
  storageBucket: "roadsos-c990a.appspot.com",
  messagingSenderId: "394592853889",
  appId: "1:394592853889:web:dbdf81b251f942c45ad280",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);  // ← Must use getFirestore(app)
```

## Testing Registration

### Test 1: Test Firestore Connection First

1. Open app in browser
2. Open **Developer Tools** (F12)
3. In **Console** tab, run:
```javascript
import { testFirestoreConnection } from './services/authService.js';
testFirestoreConnection();
```

You should see:
```
Testing Firestore connection...
✓ Firestore connection test successful
```

If you see error:
```
✗ Firestore connection test failed: [error message]
Make sure Firestore is enabled and rules are deployed
```

**Fix:** Deploy Firestore rules (Step 2 above)

### Test 2: Register with Simple User Role

1. Navigate to Register screen
2. Fill **Step 1** (Basic info):
   - Full Name: Test User
   - Phone: +1234567890
   - Email: testuser@example.com
   - Password: password123
   - Emergency Contact: +1987654321

3. Click "Continue"

4. Fill **Step 2** (Health info):
   - Blood Group: O+
   - Check "Allow location access"
   - Click "Continue"

5. Fill **Step 3** (Role):
   - Select **Normal User**
   - Click "Create account"

6. **Watch console logs** for sequence:
```
=== REGISTER STARTED ===
Form data: {...}
Selected role: user
Validation passed, starting registration
[UI] Calling onRegister
[UI] Role: user
[UI] Email: testuser@example.com
[UI] Has selfie: false
[UI] Has ID: false

=== APP REGISTER HANDLER ===
Form data: {...}
[APP] Calling registerUser
[STEP 1] Setting persistence...
[STEP 2] Persistence set
[STEP 3] Creating user with email/password...
[STEP 4] Firebase Auth Success, uid: abc123xyz
[STEP 5-SKIP] No selfie file to upload
[STEP 7-SKIP] No id proof file to upload
[STEP 9] Saving user profile to Firestore, uid: abc123xyz
[STEP 10] User profile saved to Firestore
=== REGISTER USER SUCCESS ===

[APP] Profile created: {...}
[APP] Setting profile in context
[APP] Redirecting to: /dashboard/user

=== REGISTER SUCCESS ===
[UI] Account created successfully
Account created successfully!
[UI] Registration handler finished
```

Then: **Dashboard opens**

### Test 3: Register with Responder Role

1. Navigate to Register screen
2. Fill Steps 1 & 2 same as above
3. Fill **Step 3** (Role):
   - Select **Verified Helper**
   - Government ID: ABC123
   - City: New York
   - Upload a selfie/photo file
   - Upload a verification document

4. Click "Create account"

5. **Watch console** - should see upload logs:
```
[UI] Upload progress: 10 %
[UI] Upload progress: 50 %
[UI] Upload progress: 100 %
[STEP 6] Selfie uploaded: https://firebasestorage.googleapis.com/...
[STEP 8] ID proof uploaded: https://firebasestorage.googleapis.com/...
[STEP 11] Creating responder document for role: helper
[STEP 12] Responder document created
```

Then: **Dashboard opens**

### Test 4: Verify Data in Firebase Console

1. After successful registration, go to **Firebase Console**
2. Go to **Firestore Database**
3. Look for **Collections**:
   - **users** → Should contain your user document
   - **responders** → Should contain responder document (if helper/police/hospital/fire)

4. Click on user document to verify fields:
   - uid
   - email
   - role
   - fullName
   - phone
   - createdAt (ISO timestamp)

## If Registration Still Fails

### Console Shows: "[FIRESTORE ERROR] permission-denied"
**Problem:** Firestore rules not deployed or incorrect
**Fix:**
1. Go to Firebase Console → Firestore → Rules
2. Verify rules are:
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
3. Click **Publish**
4. Wait 5-10 seconds
5. Try registration again

### Console Shows: "[FIRESTORE ERROR] not-found"
**Problem:** Firestore database doesn't exist
**Fix:**
1. Go to Firebase Console → Firestore Database
2. If "Create Database" button visible, click it
3. Select **Test Mode**
4. Select nearest region
5. Click **Create**
6. Try registration again

### Console Shows: "[FIRESTORE ERROR] permission denied for 'users' collection"
**Problem:** User doesn't have permission to create documents
**Fix:**
1. Firestore rules are too strict
2. Deploy the test rules from Step 2 above
3. Make sure you clicked **Publish**

### Console Shows Error: "FIRESTORE ERROR: invalid-argument"
**Problem:** Data schema issue
**Fix:**
1. Check firebase.js has correct projectId
2. Check createdAt/updatedAt are ISO strings (not timestamps)
3. Check profile object doesn't have null/undefined fields that cause schema errors
4. Check browser console for more detailed error message

### UI Shows: "Account created successfully!" But No Redirect
**Problem:** Navigation issue
**Fix:**
1. Check browser console for navigation errors
2. Verify EmergencyContext is working
3. Check if dashboard route exists
4. Try refreshing page

### Registration Takes Very Long (> 30 seconds)
**Problem:** Likely Firestore rules issue or network problem
**Fix:**
1. Check network tab in DevTools (F12 → Network)
2. Look for failed requests to `firebaseio.com`
3. Check Firestore rules are published
4. Try from different network if possible

## Firestore Collections Structure

After successful registration, Firestore should have:

### users Collection
```
{
  uid: "user123abc",
  email: "user@example.com",
  fullName: "John Doe",
  phone: "+1234567890",
  role: "user" | "helper" | "police" | "hospital" | "fire",
  verified: true | false,
  verificationStatus: "verified" | "pending",
  bloodGroup: "O+",
  city: "New York",
  selfieUrl: "https://...",           // Only for responders
  idProofUrl: "https://...",          // Only for responders
  createdAt: "2025-05-23T10:30:00Z",
  updatedAt: "2025-05-23T10:30:00Z",
  ...other fields
}
```

### responders Collection (If role is helper/police/hospital/fire)
```
{
  uid: "user123abc",
  name: "John Doe",
  phone: "+1234567890",
  role: "helper" | "police" | "hospital" | "fire",
  type: "Helper" | "Police" | "Ambulance" | "Fire",
  city: "New York",
  status: "pending_verification",
  verified: false,
  availability: false,
  updatedAt: "2025-05-23T10:30:00Z"
}
```

## Troubleshooting Checklist

- [ ] Firestore Database created in Firebase Console
- [ ] Firestore Rules deployed (shows "allow read, write: if true;")
- [ ] Storage Rules deployed
- [ ] firebase.js has getFirestore(app) export
- [ ] Browser console open during registration
- [ ] Can see console logs starting with "=== REGISTER STARTED ==="
- [ ] Logs show successful Firestore write (STEP 9-10 for users)
- [ ] Data appears in Firebase Console Firestore

## Support

If registration still fails:
1. Copy entire console output
2. Share:
   - Console error messages
   - Firebase project ID (roadsos-c990a)
   - Steps you performed
   - Which role you tried registering with
