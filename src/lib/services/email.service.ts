import type { Invoice } from '$lib/types/invoice';
import type { User } from '$lib/types/user';
import { formatCurrency } from '$lib/utils/calculations';

interface EmailData {
	to: string;
	subject: string;
	html: string;
	attachments: Array<{
		filename: string;
		content: Blob;
	}>;
}

function generateEmailHTML(invoice: Invoice, userProfile: User): string {
	const formatDate = (timestamp: any): string => {
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	};

	return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #1E1E1E; font-family: 'Courier New', monospace; color: #D4D4D4;">
    <div style="max-width: 600px; margin: 40px auto; padding: 20px;">
      <!-- Header -->
      <div style="background-color: #2D2D30; padding: 30px; border-left: 4px solid #007ACC;">
        <div style="color: #6A9955; font-size: 14px;">// New Invoice</div>
        <h1 style="margin: 10px 0; font-size: 24px; color: #4EC9B0;">
          Invoice ${invoice.invoiceNumber}
        </h1>
        <div style="color: #858585; font-size: 14px;">From: ${userProfile.businessInfo.name}</div>
      </div>

      <!-- Body -->
      <div style="background-color: #252526; padding: 30px; margin-top: 2px;">
        <p style="line-height: 1.6; margin: 0 0 20px 0;">
          Hi <span style="color: #4EC9B0;">${invoice.clientSnapshot.name}</span>,
        </p>

        <p style="line-height: 1.6; margin: 0 0 20px 0;">
          Your invoice is ready. Please find the details below:
        </p>

        <!-- Invoice Details -->
        <div style="background-color: #1E1E1E; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #858585;">Amount Due:</td>
              <td style="padding: 8px 0; text-align: right; color: #CE9178; font-size: 20px; font-weight: bold;">
                ${formatCurrency(invoice.total)}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #858585;">Due Date:</td>
              <td style="padding: 8px 0; text-align: right; color: #D4D4D4;">
                ${formatDate(invoice.dueDate)}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #858585;">Invoice Number:</td>
              <td style="padding: 8px 0; text-align: right; color: #D4D4D4;">
                ${invoice.invoiceNumber}
              </td>
            </tr>
          </table>
        </div>

        <p style="line-height: 1.6; margin: 20px 0 0 0; color: #858585; font-size: 13px;">
          The invoice PDF is attached to this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 30px; text-align: center; color: #858585; font-size: 12px;">
        <p style="margin: 0;">
          // ${userProfile.businessInfo.name}<br />
          // ${userProfile.businessInfo.address}<br />
          // ${userProfile.businessInfo.email}
        </p>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendInvoiceEmail(
	invoice: Invoice,
	userProfile: User,
	pdfBlob: Blob
): Promise<void> {
	const emailData: EmailData = {
		to: invoice.clientSnapshot.email,
		subject: `Invoice ${invoice.invoiceNumber} from ${userProfile.businessInfo.name}`,
		html: generateEmailHTML(invoice, userProfile),
		attachments: [
			{
				filename: `invoice-${invoice.invoiceNumber}.pdf`,
				content: pdfBlob
			}
		]
	};

	// Get access token from session storage
	const accessToken = sessionStorage.getItem('gmail_access_token');

	if (!accessToken) {
		throw new Error('Gmail access token not found. Please sign in again.');
	}

	// Note: Sending emails via Gmail API requires server-side handling or a Cloud Function
	// This is a placeholder implementation. In production, you would:
	// 1. Use a Cloud Function to send emails
	// 2. Or use the Gmail API directly with proper OAuth tokens
	// 3. Or use a service like SendGrid, Mailgun, etc.

	console.log('Email would be sent:', emailData);

	// Placeholder: In real implementation, you would call a Cloud Function or API endpoint
	// Example:
	// const response = await fetch('/api/send-email', {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify({ ...emailData, accessToken })
	// });

	throw new Error(
		'Email sending not yet implemented. Please set up Gmail API or email service provider.'
	);
}
