# Quick Setup Guide

Follow these steps to get your Invoice Generator up and running.

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Firebase Services

### Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click on **Sign-in method** tab
3. Enable **Google** provider
4. Click **Save**

### Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **production mode** (we'll deploy rules later)
3. Choose a location close to your users
4. Click **Enable**

### Create Storage Bucket
1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. Choose the same location as Firestore
4. Click **Done**

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **</>** (Web) icon to add a web app
4. Register your app with a nickname (e.g., "Invoice Generator")
5. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your Firebase configuration:

```env
PUBLIC_FIREBASE_API_KEY=AIza...
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Deploy Security Rules

Install Firebase CLI if you haven't:

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```

Initialize Firebase in your project:

```bash
firebase init
```

Select:
- **Firestore** (use existing `firestore.rules`)
- **Storage** (use existing `storage.rules`)
- **Hosting** (use `build` as public directory)

When prompted:
- "What file should be used for Firestore Rules?" → Press Enter (use `firestore.rules`)
- "What file should be used for Storage Rules?" → Press Enter (use `storage.rules`)
- "Configure as a single-page app?" → **Yes**
- "Set up automatic builds and deploys with GitHub?" → **No** (for now)

Deploy the rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open your browser to [http://localhost:5173](http://localhost:5173)

## Step 7: First Login and Setup

1. Click "Sign in with Google"
2. Authorize the application
3. You'll be redirected to the dashboard
4. Go to **Settings** and fill in your business information
5. Upload your logo (optional)
6. Go to **Clients** and add your first client
7. Go to **Invoices** → **New Invoice** to create your first invoice

## Optional: Gmail API Setup for Email Sending

The email sending feature requires additional setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable **Gmail API**
4. Configure OAuth consent screen
5. Add OAuth scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

**Note**: Full email sending implementation requires setting up Cloud Functions or a backend API. The current implementation includes the email template and structure but needs additional backend work.

## Deploying to Production

When ready to deploy:

1. Build the project:
   ```bash
   npm run build
   ```

2. Test the build locally:
   ```bash
   npm run preview
   ```

3. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

Your app will be live at: `https://your-project-id.web.app`

## Troubleshooting

### "Firebase not initialized" error
- Check that your `.env` file has all the correct Firebase config values
- Make sure environment variable names start with `PUBLIC_`
- Restart the dev server after changing `.env`

### "Permission denied" errors in Firestore
- Deploy the security rules: `firebase deploy --only firestore:rules`
- Make sure you're signed in with Google

### Logo upload fails
- Deploy storage rules: `firebase deploy --only storage:rules`
- Check file size (max 5MB)
- Ensure file is an image format

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear SvelteKit cache: `rm -rf .svelte-kit`
- Check that all dependencies are installed

## Next Steps

- Customize the theme colors in `tailwind.config.js`
- Add your own logo
- Set up custom domain in Firebase Hosting settings
- Implement email sending with Cloud Functions
- Add more features from the PRD!

## Need Help?

Refer to the full `README.md` and `PRD.md` for detailed information about the application architecture and features.
