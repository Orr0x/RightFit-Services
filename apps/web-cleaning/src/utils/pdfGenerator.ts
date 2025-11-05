import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CleaningInvoice, CleaningQuote } from '../lib/api'

// Add autoTable to jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

/**
 * Format currency for GBP
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

/**
 * Format date for UK locale
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Generate PDF for an invoice
 */
export const generateInvoicePDF = (invoice: CleaningInvoice) => {
  const doc = new jsPDF()

  // Set font
  doc.setFont('helvetica')

  // Header - Company Name
  doc.setFontSize(24)
  doc.setTextColor(40, 40, 40)
  doc.text('RightFit Services', 20, 25)

  // Invoice Title
  doc.setFontSize(18)
  doc.setTextColor(60, 60, 60)
  doc.text('INVOICE', 20, 40)

  // Invoice Number and Status
  doc.setFontSize(12)
  doc.setTextColor(80, 80, 80)
  doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 50)
  doc.text(`Status: ${invoice.status}`, 20, 57)

  // Dates - Right aligned
  doc.setFontSize(10)
  doc.text(`Issue Date: ${formatDate(invoice.issue_date)}`, 200, 40, { align: 'right' })
  doc.text(`Due Date: ${formatDate(invoice.due_date)}`, 200, 47, { align: 'right' })

  // Billed To Section
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('BILLED TO:', 20, 70)

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(invoice.customer?.business_name || '', 20, 77)
  doc.text(invoice.customer?.contact_name || '', 20, 83)
  doc.text(invoice.customer?.email || '', 20, 89)

  // Billing Period
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('BILLING PERIOD:', 120, 70)

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(`${formatDate(invoice.billing_period_start)} -`, 120, 77)
  doc.text(formatDate(invoice.billing_period_end), 120, 83)

  // Line Items Table
  const lineItemsData = invoice.invoice_line_items?.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unit_price),
    formatCurrency(item.line_total),
  ]) || []

  autoTable(doc, {
    startY: 100,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: lineItemsData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  })

  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || 100

  // Totals Section - Right aligned
  const totalsX = 145
  let currentY = finalY + 15

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text('Subtotal:', totalsX, currentY)
  doc.text(formatCurrency(invoice.subtotal), 200, currentY, { align: 'right' })

  currentY += 7
  doc.text(`Tax (${invoice.tax_rate * 100}%):`, totalsX, currentY)
  doc.text(formatCurrency(invoice.tax_amount), 200, currentY, { align: 'right' })

  // Total - Bold and larger
  currentY += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246) // Blue
  doc.text('Total:', totalsX, currentY)
  doc.text(formatCurrency(invoice.total), 200, currentY, { align: 'right' })

  // Payment Status
  if (invoice.status === 'PAID' && invoice.paid_date) {
    currentY += 15
    doc.setFontSize(10)
    doc.setTextColor(34, 197, 94) // Green
    doc.setFont('helvetica', 'normal')
    doc.text(
      `✓ Paid on ${formatDate(invoice.paid_date)}${invoice.payment_method ? ` via ${invoice.payment_method.replace(/_/g, ' ')}` : ''}`,
      20,
      currentY
    )
  }

  // Notes
  if (invoice.notes) {
    currentY += 15
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text('NOTES:', 20, currentY)

    currentY += 7
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const splitNotes = doc.splitTextToSize(invoice.notes, 170)
    doc.text(splitNotes, 20, currentY)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for your business!', 105, 280, { align: 'center' })
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, 105, 285, { align: 'center' })

  // Save the PDF
  doc.save(`invoice-${invoice.invoice_number}.pdf`)
}

/**
 * Generate PDF for a quote
 */
export const generateQuotePDF = (quote: CleaningQuote) => {
  const doc = new jsPDF()

  // Set font
  doc.setFont('helvetica')

  // Header - Company Name
  doc.setFontSize(24)
  doc.setTextColor(40, 40, 40)
  doc.text('RightFit Services', 20, 25)

  // Quote Title
  doc.setFontSize(18)
  doc.setTextColor(60, 60, 60)
  doc.text('QUOTE', 20, 40)

  // Quote Number and Status
  doc.setFontSize(12)
  doc.setTextColor(80, 80, 80)
  doc.text(`Quote #: ${quote.quote_number}`, 20, 50)
  doc.text(`Status: ${quote.status}`, 20, 57)

  // Dates - Right aligned
  doc.setFontSize(10)
  doc.text(`Quote Date: ${formatDate(quote.quote_date)}`, 200, 40, { align: 'right' })
  doc.text(`Valid Until: ${formatDate(quote.valid_until)}`, 200, 47, { align: 'right' })

  // Check if expired
  const isExpired = new Date(quote.valid_until) < new Date()
  if (isExpired && quote.status !== 'APPROVED' && quote.status !== 'DECLINED') {
    doc.setTextColor(220, 38, 38) // Red
    doc.text('EXPIRED', 200, 54, { align: 'right' })
  }

  // Quote For Section
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('QUOTE FOR:', 20, 70)

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(quote.customer?.business_name || '', 20, 77)
  doc.text(quote.customer?.contact_name || '', 20, 83)
  doc.text(quote.customer?.email || '', 20, 89)

  // Property (if exists)
  if (quote.property) {
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text('PROPERTY:', 120, 70)

    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text(quote.property.property_name, 120, 77)
    doc.text(quote.property.address, 120, 83)
  }

  // Service Description
  let currentY = 100
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('SERVICE DESCRIPTION:', 20, currentY)

  currentY += 7
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  const splitDescription = doc.splitTextToSize(quote.service_description, 170)
  doc.text(splitDescription, 20, currentY)

  currentY += splitDescription.length * 5 + 10

  // Line Items Table
  const lineItemsData = quote.quote_line_items?.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unit_price),
    formatCurrency(item.line_total),
  ]) || []

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: lineItemsData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  })

  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || currentY

  // Totals Section - Right aligned
  const totalsX = 145
  currentY = finalY + 15

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text('Subtotal:', totalsX, currentY)
  doc.text(formatCurrency(quote.subtotal), 200, currentY, { align: 'right' })

  // Discount (if applicable)
  if (quote.discount_percentage > 0) {
    currentY += 7
    doc.setTextColor(34, 197, 94) // Green
    doc.text(`Discount (${quote.discount_percentage}%):`, totalsX, currentY)
    doc.text(`-${formatCurrency(quote.discount_amount)}`, 200, currentY, { align: 'right' })
    doc.setTextColor(80, 80, 80)
  }

  currentY += 7
  doc.text(`Tax (${quote.tax_rate * 100}%):`, totalsX, currentY)
  doc.text(formatCurrency(quote.tax_amount), 200, currentY, { align: 'right' })

  // Total - Bold and larger
  currentY += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246) // Blue
  doc.text('Total:', totalsX, currentY)
  doc.text(formatCurrency(quote.total), 200, currentY, { align: 'right' })

  // Status Messages
  if (quote.status === 'APPROVED' && quote.approved_date) {
    currentY += 15
    doc.setFontSize(10)
    doc.setTextColor(34, 197, 94) // Green
    doc.setFont('helvetica', 'normal')
    doc.text(`✓ Quote approved on ${formatDate(quote.approved_date)}`, 20, currentY)
  }

  if (quote.status === 'DECLINED' && quote.declined_date) {
    currentY += 15
    doc.setFontSize(10)
    doc.setTextColor(220, 38, 38) // Red
    doc.setFont('helvetica', 'normal')
    doc.text(`✗ Quote declined on ${formatDate(quote.declined_date)}`, 20, currentY)
    if (quote.declined_reason) {
      currentY += 7
      doc.setFontSize(9)
      const splitReason = doc.splitTextToSize(`Reason: ${quote.declined_reason}`, 170)
      doc.text(splitReason, 20, currentY)
    }
  }

  // Notes
  if (quote.notes) {
    currentY += 15
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text('NOTES:', 20, currentY)

    currentY += 7
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const splitNotes = doc.splitTextToSize(quote.notes, 170)
    doc.text(splitNotes, 20, currentY)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for considering our services!', 105, 280, { align: 'center' })
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, 105, 285, { align: 'center' })

  // Save the PDF
  doc.save(`quote-${quote.quote_number}.pdf`)
}
