# Product Requirements Document: Invoice Generator

---

> **SLC Commiment: This PRD defines an **SLC (Simple, Lovable, Complete)\** **25.0.0** - *not\* an MVP. The release must feel complete, polished, an delightful even with a tight scope.

---

## Overview

A developer-themed invoice generation and management system built with SvelteKit and Firebase. Allows quick PDF invoice creation and email delivery with Google authentication.

**Target User**: Solo web developer  
**Primary Use Case**: Generate and email professional invoices to clients

---

## Tech Stack

| Component              | Technology                         |
| ---------------------- | ---------------------------------- |
| **Frontend Framework** | SvelteKit                          |
| **Styling**            | Tailwind CSS                       |
| **Authentication**     | Firebase Auth (Google OAuth)       |
| **Database**           | Firestore                          |
| **File Storage**       | Firebase Storage                   |
| **Email**              | Gmail API                          |
| **PDF Generation**     | jsPDF or pdfmake                   |
| **Hosting**            | Firebase Hosting + Cloud Functions |

---

## Design System

### Theme: Developer IDE Inspired

Based on VS Code Dark+ theme for a familiar, comfortable developer experience.

### Color Palette

```css
--primary: #007ACC        /* VS Code blue - primary actions */
--bg-primary: #1E1E1E     /* Main background */
--bg-secondary: #252526   /* Secondary background */
--surface: #2D2D30        /* Cards, modals */
--text-primary: #D4D4D4   /* Primary text */
--text-secondary: #858585 /* Secondary text */
--accent-teal: #4EC9B0    /* Success, highlights (like string literals) */
--accent-orange: #CE9178  /* Warnings, due dates (like numbers) */
--accent-green: #6A9955   /* Success states (like comments) */
--error: #F48771          /* Error states */
```

### Typography

- **Headers**: JetBrains Mono or Fira Code (monospace)
- **Body Text**: Inter or system fonts
- **Numbers/Data**: Tabular figures for alignment
- **Invoice Numbers**: Styled like function calls - `INV-2024-001()`

### Component Patterns

- **Buttons**: Terminal-style with cursor effect on hover
- **Inputs**: Dark theme with syntax-highlighting inspired borders
- **Cards**: Subtle shadows, elevated surfaces
- **Status Badges**: Color-coded like code tokens
- **Comments**: Use `//` and `/* */` style for labels/help text

---

## Data Models

### User Collection (`users/{uid}`)

```typescript
{
  uid: string;
  email: string;
  displayName: string;
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
    taxId?: string;
  };
  settings: {
    defaultTaxRate: number;
    invoicePrefix: string; // Default: "INV"
    invoiceStartNumber: number; // Default: 1
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Clients Collection (`users/{uid}/clients/{clientId}`)

```typescript
{
  id: string; // Auto-generated
  name: string;
  email: string;
  address: string;
  phone?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Invoices Collection (`users/{uid}/invoices/{invoiceId}`)

```typescript
{
  id: string; // Auto-generated
  invoiceNumber: string; // Format: {prefix}-YYYY-###

  // Client information (denormalized for historical accuracy)
  clientId: string;
  clientSnapshot: {
    name: string;
    email: string;
    address: string;
    phone?: string;
  };

  // Dates
  date: Timestamp;
  dueDate: Timestamp;

  // Line items
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number; // quantity * rate
  }>;

  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  // Status and tracking
  status: 'draft' | 'sent' | 'paid';
  sentAt?: Timestamp;
  paidAt?: Timestamp;

  // Additional
  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Features & User Stories

### Authentication

**As a user, I want to:**

- Sign in with my Google account
- Have my invoices accessible only to me
- Use my Google account to send emails

**OAuth Scopes Required:**

- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

**Acceptance Criteria:**

- ✅ User can only access app when authenticated
- ✅ All routes except `/login` are protected
- ✅ Gmail API tokens are properly stored and refreshed
- ✅ Sign out functionality clears all tokens

---

### Dashboard (`/`)

**As a user, I want to:**

- See an overview of my invoice activity
- Quickly create a new invoice
- Access recent invoices

**Components:**

- Quick stats cards:
  - Total outstanding amount
  - Total paid this month
  - Number of overdue invoices
  - Number of draft invoices
- Recent invoices list (last 10)
- Prominent "Create New Invoice" CTA
- Terminal/IDE inspired welcome message

**Acceptance Criteria:**

- ✅ Stats calculate correctly in real-time
- ✅ Recent invoices show correct status
- ✅ Click invoice to view/edit
- ✅ Loading states while fetching data

---

### Client Management (`/clients`)

**As a user, I want to:**

- View all my clients in a list
- Search for specific clients
- Add new clients
- Edit existing client information
- Delete clients (with confirmation)
- Quickly create an invoice for a client

**UI Components:**

- Searchable/filterable client list
- Add Client modal/form
- Edit Client modal/form
- Delete confirmation dialog
- "Create Invoice" quick action per client

**Acceptance Criteria:**

- ✅ Search works on name and email
- ✅ Client list shows contact info preview
- ✅ Cannot delete client with existing invoices (soft delete or block)
- ✅ Form validation for required fields
- ✅ Success/error feedback on actions

---

### Invoice Management (`/invoices`)

**As a user, I want to:**

- View all invoices in a list
- Filter by status (all, draft, sent, paid)
- Filter by date range
- Search invoices by number or client name
- See invoice details at a glance
- Perform quick actions (send, download, mark paid)

**UI Components:**

- Invoice list with filters
- Status badges (color-coded)
- Search input
- Date range picker
- Action buttons per invoice

**Acceptance Criteria:**

- ✅ Filters work independently and combined
- ✅ Search is performant
- ✅ List shows: invoice #, client, date, amount, status
- ✅ Pagination or infinite scroll for large lists
- ✅ Sort by date (newest first default)

---

### Create/Edit Invoice (`/invoices/new`, `/invoices/[id]`)

**As a user, I want to:**

- Select a client from my list
- Set invoice and due dates
- Add multiple line items with description, quantity, and rate
- See calculations update in real-time
- Add optional notes
- Save as draft or send immediately
- Preview the PDF before sending

**UI Components:**

- Client selector dropdown (searchable)
- Date pickers (invoice date, due date)
- Dynamic line items table:
  - Description (text)
  - Quantity (number)
  - Rate (currency)
  - Amount (calculated, read-only)
  - Remove button
- Add line item button
- Calculations display:
  - Subtotal (calculated)
  - Tax rate (editable, defaults from settings)
  - Tax amount (calculated)
  - Total (calculated)
- Notes textarea
- Action buttons:
  - Save Draft
  - Preview PDF
  - Send Invoice
- Live PDF preview pane (optional)

**Business Logic:**

- Auto-generate invoice number on first save
- Invoice number format: `{prefix}-YYYY-###` (e.g., `INV-2024-001`)
- Calculate amounts: `amount = quantity * rate`
- Calculate subtotal: sum of all line item amounts
- Calculate tax: `subtotal * (taxRate / 100)`
- Calculate total: `subtotal + tax`

**Acceptance Criteria:**

- ✅ All calculations update in real-time
- ✅ Cannot save without client and at least one line item
- ✅ Date validation (due date cannot be before invoice date)
- ✅ Draft saves without sending email
- ✅ Send action generates PDF and emails client
- ✅ Form state persists when switching tabs (unsaved changes warning)

---

### Settings (`/settings`)

**As a user, I want to:**

- Set my business information
- Upload my business logo
- Set default tax rate
- Customize invoice number format

**UI Components:**

- Business info form:
  - Business name
  - Address
  - Phone
  - Email
  - Tax ID (optional)
- Logo upload (with preview)
- Default tax rate input
- Invoice prefix input
- Save button

**Acceptance Criteria:**

- ✅ Business info required to create first invoice
- ✅ Logo uploads to Firebase Storage
- ✅ Logo preview shows immediately after upload
- ✅ Changes save successfully
- ✅ Validation on all fields

---

## PDF Invoice Design

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [LOGO]                       INVOICE #INV-2024-001()   │
│  Your Business Name                                     │
│  Your Address                                           │
│  Your Phone | Your Email                                │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  // Invoice Details                                     │
│  Date: December 12, 2024                                │
│  Due Date: January 12, 2025                             │
│                                                         │
│  // Billed To                                           │
│  Client Name                                            │
│  Client Address                                         │
│  Client Email                                           │
│                                                         │
│  ═════════════════════════════════════════════════════  │
│                                                         │
│  DESCRIPTION              QTY    RATE         AMOUNT    │
│  ─────────────────────────────────────────────────────  │
│  Web Development           1    $1,000.00   $1,000.00   │
│  Hosting Setup             1      $150.00     $150.00   │
│  Domain Registration       1       $15.00      $15.00   │
│                                                         │
│                                                         │
│                                    Subtotal: $1,165.00  │
│                                    Tax (10%):  $116.50  │
│  ═════════════════════════════════════════════════════  │
│                                      Total:  $1,281.50  │
│                                                         │
│  /* Payment Terms */                                    │
│  Payment due within 30 days                             │
│  Please include invoice number with payment             │
│                                                         │
│  /* Notes */                                            │
│  Thank you for your business!                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Design Specifications

- **Page Size**: US Letter (8.5" x 11")
- **Margins**: 0.75" all sides
- **Fonts**:
  - Headers: JetBrains Mono Bold (16-18pt)
  - Body: JetBrains Mono Regular (10-11pt)
  - Numbers: Tabular figures for alignment
- **Colors**: Use theme colors (subtle, professional)
- **Comments**: Use syntax highlighting style for section headers
  - `// Invoice Details` style for labels
  - `/* Payment Terms */` style for footer sections
- **Logo**: Top left, max 150x75px
- **Invoice Number**: Top right, styled like a function call
- **Line Items Table**: Monospace aligned columns
- **Totals**: Right-aligned, bold
- **Borders**: Subtle, use theme colors

---

## Email Template

### Email Subject

```
Invoice #{invoiceNumber} from {businessName}
```

### Email Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
  margin: 0;
  padding: 0;
  background-color: #1E1E1E;
  font-family: 'Courier New', monospace;
  color: #D4D4D4;
"
  >
    <div style="max-width: 600px; margin: 40px auto; padding: 20px;">
      <!-- Header -->
      <div
        style="
      background-color: #2D2D30;
      padding: 30px;
      border-left: 4px solid #007ACC;
    "
      >
        <div style="color: #6A9955; font-size: 14px;">// New Invoice</div>
        <h1
          style="
        margin: 10px 0;
        font-size: 24px;
        color: #4EC9B0;
      "
        >
          Invoice #{invoiceNumber}
        </h1>
        <div style="color: #858585; font-size: 14px;">From: {businessName}</div>
      </div>

      <!-- Body -->
      <div
        style="
      background-color: #252526;
      padding: 30px;
      margin-top: 2px;
    "
      >
        <p style="line-height: 1.6; margin: 0 0 20px 0;">
          Hi <span style="color: #4EC9B0;">{clientName}</span>,
        </p>

        <p style="line-height: 1.6; margin: 0 0 20px 0;">
          Your invoice is ready. Please find the details below:
        </p>

        <!-- Invoice Details -->
        <div
          style="
        background-color: #1E1E1E;
        padding: 20px;
        border-radius: 4px;
        margin: 20px 0;
      "
        >
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #858585;">Amount Due:</td>
              <td
                style="padding: 8px 0; text-align: right; color: #CE9178; font-size: 20px; font-weight: bold;"
              >
                ${total}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #858585;">Due Date:</td>
              <td style="padding: 8px 0; text-align: right; color: #D4D4D4;">
                {dueDate}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #858585;">Invoice Number:</td>
              <td style="padding: 8px 0; text-align: right; color: #D4D4D4;">
                {invoiceNumber}
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a
            href="attachment:invoice.pdf"
            style="
          display: inline-block;
          background-color: #007ACC;
          color: #FFFFFF;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        "
          >
            /* View Invoice */
          </a>
        </div>

        <p
          style="line-height: 1.6; margin: 20px 0 0 0; color: #858585; font-size: 13px;"
        >
          The invoice PDF is attached to this email.
        </p>
      </div>

      <!-- Footer -->
      <div
        style="
      padding: 20px 30px;
      text-align: center;
      color: #858585;
      font-size: 12px;
    "
      >
        <p style="margin: 0;">
          // {businessName}<br />
          // {businessAddress}<br />
          // {businessEmail}
        </p>
      </div>
    </div>
  </body>
</html>
```

### Email Specifications

- **From**: User's Google account email
- **To**: Client email from invoice
- **Subject**: Template above with variables replaced
- **Body**: HTML template above
- **Attachment**: Generated PDF invoice
- **Reply-To**: Business email from settings

---

## Implementation Phases

### Phase 1: Project Setup & Authentication

**Tasks:**

1. Initialize SvelteKit project with TypeScript
2. Set up Tailwind CSS with custom theme
3. Initialize Firebase project
4. Configure Firebase Auth with Google provider
5. Create auth store/context
6. Implement protected routes
7. Build login page
8. Build basic layout with navigation

**Deliverables:**

- Working authentication flow
- Protected app shell
- Basic navigation structure

---

### Phase 2: Settings & Business Info

**Tasks:**

1. Create Firestore security rules
2. Build settings page UI
3. Implement business info form
4. Add logo upload to Firebase Storage
5. Create user profile initialization flow
6. Add form validation

**Deliverables:**

- Settings page with business info form
- Logo upload functionality
- User profile stored in Firestore

---

### Phase 3: Client Management

**Tasks:**

1. Create client Firestore collection
2. Build clients list page
3. Implement search/filter functionality
4. Create add/edit client modal
5. Add delete client with confirmation
6. Implement CRUD operations
7. Add form validation

**Deliverables:**

- Full client management system
- Search and filter functionality
- CRUD operations working

---

### Phase 4: Invoice Creation

**Tasks:**

1. Create invoice Firestore collection
2. Build invoice form UI
3. Implement client selector
4. Add dynamic line items
5. Build calculation logic
6. Add invoice number auto-generation
7. Implement save as draft
8. Add form validation
9. Create invoice list page with filters

**Deliverables:**

- Invoice creation/editing form
- Auto-calculations working
- Draft save functionality
- Invoice listing with filters

---

### Phase 5: Dashboard

**Tasks:**

1. Build dashboard layout
2. Implement stats calculations
3. Create recent invoices widget
4. Add quick action buttons
5. Style with IDE theme

**Deliverables:**

- Dashboard with stats
- Recent activity display
- Quick actions

---

### Phase 6: PDF Generation

**Tasks:**

1. Choose PDF library (jsPDF or pdfmake)
2. Create PDF template matching design spec
3. Implement PDF generation function
4. Add logo to PDF
5. Style with IDE theme colors
6. Add preview functionality
7. Test with various invoice sizes

**Deliverables:**

- PDF generation working
- PDF matches design spec
- Preview functionality

---

### Phase 7: Email Integration

**Tasks:**

1. Set up Gmail API with proper scopes
2. Create email HTML template
3. Implement send email function
4. Attach PDF to email
5. Update invoice status after send
6. Add error handling
7. Create send confirmation UI

**Deliverables:**

- Email sending functionality
- Professional email template
- Status tracking

---

### Phase 8: Polish & Optimization

**Tasks:**

1. Add loading states everywhere
2. Implement error handling
3. Add success/error toast notifications
4. Make responsive for mobile
5. Add keyboard shortcuts
6. Performance optimization
7. Add empty states
8. Accessibility improvements
9. Testing on various devices

**Deliverables:**

- Polished, production-ready app
- Responsive design
- Good UX throughout

---

### Phase 9: Deployment

**Tasks:**

1. Configure Firebase Hosting
2. Set up environment variables
3. Build deployment script
4. Deploy to Firebase
5. Test in production
6. Set up custom domain (if needed)

**Deliverables:**

- App deployed and accessible
- All features working in production

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isSignedIn() && isOwner(userId);

      // Clients subcollection
      match /clients/{clientId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }

      // Invoices subcollection
      match /invoices/{invoiceId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
    }
  }
}
```

## Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // User uploads (logos, etc.)
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024 // 5MB max
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Environment Variables

```env
# Firebase Config
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=

# Gmail API (handled by Firebase Auth)
# Scopes configured in Firebase Console
```

---

## File Structure

```
invoice-generator/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Badge.svelte
│   │   │   │   └── Toast.svelte
│   │   │   ├── ClientSelector.svelte
│   │   │   ├── LineItemsTable.svelte
│   │   │   ├── InvoicePreview.svelte
│   │   │   ├── StatsCard.svelte
│   │   │   └── Navigation.svelte
│   │   ├── stores/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   └── toast.ts
│   │   ├── services/
│   │   │   ├── firebase.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── client.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── storage.service.ts
│   │   ├── utils/
│   │   │   ├── calculations.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── invoice-number.ts
│   │   └── types/
│   │       ├── user.ts
│   │       ├── client.ts
│   │       └── invoice.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   ├── +page.svelte              // Dashboard
│   │   ├── login/
│   │   │   └── +page.svelte
│   │   ├── clients/
│   │   │   └── +page.svelte
│   │   ├── invoices/
│   │   │   ├── +page.svelte          // Invoice list
│   │   │   ├── new/
│   │   │   │   └── +page.svelte
│   │   │   └── [id]/
│   │   │       └── +page.svelte      // Edit invoice
│   │   └── settings/
│   │       └── +page.svelte
│   ├── app.html
│   └── app.css
├── static/
│   └── favicon.png
├── firebase.json
├── firestore.rules
├── storage.rules
├── tailwind.config.js
├── svelte.config.js
├── vite.config.ts
├── package.json
├── tsconfig.json
└── PRD.md
```

---

## Success Metrics

### Functional Requirements Met

- ✅ User can authenticate with Google
- ✅ User can manage clients (CRUD)
- ✅ User can create invoices with line items
- ✅ Calculations are accurate
- ✅ PDF generates correctly
- ✅ Email sends successfully
- ✅ Invoice statuses update properly

### Performance

- Page load < 2s
- Invoice generation < 1s
- Email send < 3s
- Real-time calculations instantaneous

### UX

- Mobile responsive
- Loading states on all async operations
- Error messages are helpful
- Success feedback is clear
- Keyboard accessible

---

## Future Enhancements (Out of Scope for V1)

- Multiple users/team collaboration
- Recurring invoices
- Payment integration (Stripe)
- Invoice templates
- Multi-currency support
- Expense tracking
- Client portal for viewing invoices
- Analytics and reporting
- Invoice reminders
- Export to accounting software
- API for integrations
- Custom domains for email

---

## Open Questions & Decisions Needed

- [ ] PDF library choice: jsPDF vs pdfmake?
- [ ] Should we add invoice templates in V1?
- [ ] Email tracking (open rates)?
- [ ] Offline support needed?
- [ ] Multi-language support?

---

## Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Set up Firebase project
4. Configure environment variables
5. Run development server: `npm run dev`
6. Follow implementation phases in order

---

**Version**: 1.0  
**Last Updated**: December 12, 2024  
**Status**: Ready for Development
