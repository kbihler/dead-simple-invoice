# Invoice Generator

A developer-themed invoice generation and management system built with SvelteKit and Firebase.

## Features

- 🔐 Google OAuth Authentication
- 👥 Client Management
- 📄 Invoice Creation with Line Items
- 💰 Automatic Calculations (Subtotal, Tax, Total)
- 📊 Dashboard with Statistics
- 🎨 VS Code Dark+ Theme
- 📱 Responsive Design
- 🔒 Secure with Firestore Rules

## Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Firestore
- **Storage**: Firebase Storage
- **PDF Generation**: jsPDF
- **Hosting**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account
- Google Cloud Console account (for Gmail API)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Google provider
4. Create a Firestore database (start in production mode, rules will be deployed later)
5. Create a Storage bucket
6. Get your Firebase configuration from Project Settings

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Gmail API (Optional - for Email Sending)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable Gmail API
4. Configure OAuth consent screen
5. Add scopes: `gmail.send`, `userinfo.email`, `userinfo.profile`
6. In Firebase Console > Authentication > Sign-in method > Google > Advanced settings
7. Add OAuth scopes

### 5. Deploy Firestore and Storage Rules

Install Firebase CLI:

```bash
npm install -g firebase-tools
```

Login and initialize:

```bash
firebase login
firebase init
```

Select:
- Firestore
- Storage
- Hosting

Deploy rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
kb-invoice/
├── src/
│   ├── lib/
│   │   ├── components/ui/     # Reusable UI components
│   │   ├── services/          # Firebase and API services
│   │   ├── stores/            # Svelte stores
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── routes/                # SvelteKit routes
│   │   ├── login/            # Login page
│   │   ├── clients/          # Client management
│   │   ├── invoices/         # Invoice pages
│   │   ├── settings/         # Settings page
│   │   └── +page.svelte      # Dashboard
│   ├── app.css               # Global styles
│   └── app.html              # HTML template
├── static/                    # Static assets
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── firebase.json             # Firebase configuration
└── tailwind.config.js        # Tailwind configuration
```

## Usage

### First Time Setup

1. **Sign In**: Click "Sign in with Google" on the login page
2. **Configure Business Info**: Go to Settings and add your business information
3. **Add Clients**: Navigate to Clients and add your first client
4. **Create Invoice**: Go to Invoices → New Invoice to create your first invoice

### Creating an Invoice

1. Select a client from the dropdown
2. Set invoice and due dates
3. Add line items (description, quantity, rate)
4. Adjust tax rate if needed
5. Add optional notes
6. Save as draft or create invoice

### Managing Clients

- View all clients in a searchable list
- Add, edit, or delete clients
- Create invoices directly from client cards

### Dashboard

- View key statistics (outstanding, paid this month, overdue, drafts)
- See recent invoices
- Quick access to common actions

## Building for Production

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Deploying to Firebase

Build the project:

```bash
npm run build
```

Deploy to Firebase Hosting:

```bash
firebase deploy
```

## Security

- All data is scoped to authenticated users
- Firestore rules prevent unauthorized access
- Storage rules limit file uploads to 5MB images only
- Client-side validation on all forms

## Notes

- Email sending requires additional setup with Gmail API or an email service provider
- PDF generation is done client-side using jsPDF
- The app uses client-side rendering (SSR disabled)
- All calculations are performed in real-time

## Future Enhancements

- PDF email sending via Cloud Functions
- Recurring invoices
- Payment integration (Stripe)
- Multiple invoice templates
- Export to accounting software
- Invoice reminders
- Client portal

## License

MIT

## Support

For issues and questions, please refer to the PRD.md file or create an issue in the repository.
