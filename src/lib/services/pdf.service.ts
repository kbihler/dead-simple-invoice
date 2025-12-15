import { jsPDF } from "jspdf";
import type { Invoice } from "$lib/types/invoice";
import type { User } from "$lib/types/user";
import { formatCurrency } from "$lib/utils/calculations";

export async function generateInvoicePDF(
  invoice: Invoice,
  userProfile: User
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 0.75;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Colors (Print-friendly for white background)
  const colors = {
    primary: [0, 102, 204], // Professional blue
    accent: [0, 128, 128], // Teal for headings
    textPrimary: [0, 0, 0], // Black for main text
    textSecondary: [80, 80, 80], // Dark gray for secondary text
    border: [200, 200, 200], // Light gray for borders
    highlight: [51, 51, 51], // Dark charcoal for emphasis
  };

  // Helper function to format date
  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Logo and Business Info (Left)
  if (userProfile.businessInfo.logoUrl) {
    try {
      doc.addImage(
        userProfile.businessInfo.logoUrl,
        "PNG",
        margin,
        y,
        1.5,
        0.75
      );
      y += 0.9;
    } catch (e) {
      console.warn("Could not load logo:", e);
    }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    colors.textPrimary[0],
    colors.textPrimary[1],
    colors.textPrimary[2]
  );
  doc.text(userProfile.businessInfo.name, margin, y);
  y += 0.2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.textSecondary[0],
    colors.textSecondary[1],
    colors.textSecondary[2]
  );
  doc.text(userProfile.businessInfo.address, margin, y);
  y += 0.15;
  doc.text(
    `${userProfile.businessInfo.phone} | ${userProfile.businessInfo.email}`,
    margin,
    y
  );

  // Invoice Number (Right)
  doc.setFontSize(18);
  doc.setFont("courier", "bold");
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(`INVOICE ${invoice.invoiceNumber}`, pageWidth - margin, margin, {
    align: "right",
  });

  // Divider
  y = 2.0;
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.02);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.3;

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    colors.highlight[0],
    colors.highlight[1],
    colors.highlight[2]
  );
  doc.text("Invoice Details", margin, y);
  y += 0.2;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.textPrimary[0],
    colors.textPrimary[1],
    colors.textPrimary[2]
  );
  doc.text(`Date: ${formatDate(invoice.date)}`, margin, y);
  y += 0.15;
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, margin, y);
  y += 0.3;

  // Billed To
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    colors.highlight[0],
    colors.highlight[1],
    colors.highlight[2]
  );
  doc.text("Billed To", margin, y);
  y += 0.2;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(invoice.clientSnapshot.name, margin, y);
  y += 0.15;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.textPrimary[0],
    colors.textPrimary[1],
    colors.textPrimary[2]
  );
  doc.text(invoice.clientSnapshot.address, margin, y);
  y += 0.15;
  doc.text(invoice.clientSnapshot.email, margin, y);
  if (invoice.clientSnapshot.phone) {
    y += 0.15;
    doc.text(invoice.clientSnapshot.phone, margin, y);
  }
  y += 0.4;

  // Line Items Table Header
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.02);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.15;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    colors.highlight[0],
    colors.highlight[1],
    colors.highlight[2]
  );
  doc.text("DESCRIPTION", margin, y);
  doc.text("QTY", pageWidth - margin - 3.5, y, { align: "right" });
  doc.text("RATE", pageWidth - margin - 2.3, y, { align: "right" });
  doc.text("AMOUNT", pageWidth - margin, y, { align: "right" });
  y += 0.05;

  doc.setLineWidth(0.01);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.2;

  // Line Items
  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.textPrimary[0],
    colors.textPrimary[1],
    colors.textPrimary[2]
  );

  for (const item of invoice.lineItems) {
    if (y > 9.5) {
      doc.addPage();
      y = margin;
    }

    doc.text(item.description, margin, y, { maxWidth: 3.5 });
    doc.text(item.quantity.toString(), pageWidth - margin - 3.5, y, {
      align: "right",
    });
    doc.text(formatCurrency(item.rate), pageWidth - margin - 2.3, y, {
      align: "right",
    });
    doc.text(formatCurrency(item.amount), pageWidth - margin, y, {
      align: "right",
    });
    y += 0.25;
  }

  y += 0.2;

  // Subtotal, Tax, Total
  const totalsX = pageWidth - margin - 2;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.textSecondary[0],
    colors.textSecondary[1],
    colors.textSecondary[2]
  );
  doc.text("Subtotal:", totalsX, y, { align: "right" });
  doc.setTextColor(
    colors.textPrimary[0],
    colors.textPrimary[1],
    colors.textPrimary[2]
  );
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, y, {
    align: "right",
  });
  y += 0.18;

  doc.setTextColor(
    colors.textSecondary[0],
    colors.textSecondary[1],
    colors.textSecondary[2]
  );
  doc.text(`Tax (${invoice.taxRate}%):`, totalsX, y, { align: "right" });
  doc.setTextColor(
    colors.textPrimary[0],
    colors.textPrimary[1],
    colors.textPrimary[2]
  );
  doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin, y, {
    align: "right",
  });
  y += 0.1;

  // Total line
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.02);
  doc.line(totalsX - 0.5, y, pageWidth - margin, y);
  y += 0.18;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text("Total:", totalsX, y, { align: "right" });
  doc.text(formatCurrency(invoice.total), pageWidth - margin, y, {
    align: "right",
  });
  y += 0.4;

  // Notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      colors.highlight[0],
      colors.highlight[1],
      colors.highlight[2]
    );
    doc.text("Notes", margin, y);
    y += 0.15;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(
      colors.textPrimary[0],
      colors.textPrimary[1],
      colors.textPrimary[2]
    );
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 0.15 + 0.3;
  } else {
    y += 0.3;
  }

  // Footer - Thank you message and contact info
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = Math.max(y, pageHeight - 1.5);

  // Divider line above footer
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.01);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  y = footerY + 0.25;

  // Thank you message
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text("Thank you for your business!", pageWidth / 2, y, {
    align: "center",
  });
  y += 0.25;

  // Contact information
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    colors.textSecondary[0],
    colors.textSecondary[1],
    colors.textSecondary[2]
  );

  // const contactInfo = [
  // 	userProfile.businessInfo.name,
  // 	userProfile.businessInfo.address,
  // 	`${userProfile.businessInfo.phone} • ${userProfile.businessInfo.email}`
  // ];

  // for (const line of contactInfo) {
  // 	doc.text(line, pageWidth / 2, y, { align: 'center' });
  // 	y += 0.15;
  // }

  return doc.output("blob");
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
