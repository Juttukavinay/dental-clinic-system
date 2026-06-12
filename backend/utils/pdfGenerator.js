const PDFDocument = require('pdfkit');

/**
 * Generates a styled Prescription PDF and pipes it to the HTTP response
 */
const generatePrescriptionPDF = (prescription, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // Pipe PDF stream directly to Express response
  doc.pipe(res);

  // Colors
  const primaryColor = '#0F172A'; // Slate 900
  const secondaryColor = '#0EA5E9'; // Sky 500
  const textColor = '#334155'; // Slate 700

  // Header Letterhead
  doc.fillColor(primaryColor)
     .fontSize(22)
     .text('APEX DENTAL CARE', { align: 'left', bold: true });
  
  doc.fontSize(10)
     .fillColor(secondaryColor)
     .text('Modern Dentistry & Smile Design Center', { align: 'left' });
  
  doc.fontSize(9)
     .fillColor(textColor)
     .text('Plot 42, Health City Sector, Suite 101\nPhone: +1 555-019-2834 | Email: contact@apexdental.com', { align: 'right' });
  
  doc.moveDown(1.5);
  
  // Horizontal divider line
  doc.strokeColor('#E2E8F0')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();
  
  doc.moveDown(1.5);

  // Metadata Columns (Doctor & Patient details)
  const metaY = doc.y;
  doc.fillColor(primaryColor).fontSize(11).text('DENTIST INFO', 50, metaY, { bold: true });
  doc.fillColor(textColor).fontSize(10)
     .text(`Dr. ${prescription.dentist.name}`, 50, metaY + 15)
     .text(`${prescription.dentist.specialization || 'General Dentist'}`, 50, metaY + 30)
     .text(`Email: ${prescription.dentist.email}`, 50, metaY + 45);

  doc.fillColor(primaryColor).fontSize(11).text('PATIENT INFO', 300, metaY, { bold: true });
  doc.fillColor(textColor).fontSize(10)
     .text(`Name: ${prescription.patient.name}`, 300, metaY + 15)
     .text(`ID: ${prescription.patient.patientId}`, 300, metaY + 30)
     .text(`Gender/Age: ${prescription.patient.gender} (${calculateAge(prescription.patient.dateOfBirth)} yrs)`, 300, metaY + 45);

  doc.moveDown(5);

  // Center Rx Symbol
  doc.fillColor(secondaryColor).fontSize(24).text('Rx', 50, doc.y, { bold: true });
  doc.moveDown(0.5);

  // Medicines Table Header
  const tableTop = doc.y;
  doc.rect(50, tableTop, 495, 20).fill('#F1F5F9');
  doc.fillColor(primaryColor).fontSize(10)
     .text('Medicine Details', 60, tableTop + 5, { bold: true })
     .text('Dosage', 240, tableTop + 5, { bold: true })
     .text('Frequency', 340, tableTop + 5, { bold: true })
     .text('Duration', 450, tableTop + 5, { bold: true });

  let currentY = tableTop + 25;

  // Medicines list
  prescription.medicines.forEach((med, idx) => {
    // Alternating rows background
    if (idx % 2 === 0) {
      doc.rect(50, currentY - 2, 495, 26).fill('#F8FAFC');
    }
    
    doc.fillColor(primaryColor).fontSize(10).text(med.name, 60, currentY, { bold: true });
    doc.fontSize(9).fillColor(textColor).text(med.instructions, 60, currentY + 11, { italic: true });

    doc.fillColor(textColor).fontSize(10)
       .text(med.dosage, 240, currentY + 5)
       .text(med.frequency, 340, currentY + 5)
       .text(med.duration, 450, currentY + 5);

    currentY += 32;
  });

  doc.y = currentY + 15;

  // Notes
  if (prescription.notes) {
    doc.fillColor(primaryColor).fontSize(11).text('Additional Instructions / Notes:', 50, doc.y, { bold: true });
    doc.fillColor(textColor).fontSize(10).text(prescription.notes, 50, doc.y + 5);
    doc.moveDown(2);
  }

  // Footer/Signatures
  doc.strokeColor('#E2E8F0')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();
  
  doc.moveDown(1.5);
  doc.fillColor(textColor).fontSize(9).text('This is a digitally generated prescription. Please follow clinical advice.', 50, doc.y);
  
  // Signature Line on bottom-right
  const sigY = 720;
  doc.moveTo(380, sigY).lineTo(520, sigY).strokeColor(primaryColor).stroke();
  doc.fillColor(primaryColor).fontSize(10).text(`Dr. ${prescription.dentist.name}`, 380, sigY + 5, { align: 'center', width: 140 });
  doc.fontSize(8).fillColor(textColor).text('Authorized Signature', 380, sigY + 18, { align: 'center', width: 140 });

  doc.end();
};

/**
 * Generates a styled Invoice PDF and pipes it to the HTTP response
 */
const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // Pipe PDF stream directly to Express response
  doc.pipe(res);

  // Colors
  const primaryColor = '#0F172A'; // Slate 900
  const secondaryColor = '#0EA5E9'; // Sky 500
  const textColor = '#334155'; // Slate 700

  // Header Letterhead
  doc.fillColor(primaryColor)
     .fontSize(22)
     .text('APEX DENTAL CARE', { align: 'left', bold: true });
  
  doc.fontSize(10)
     .fillColor(secondaryColor)
     .text('Invoice & Billing Receipt', { align: 'left' });
  
  doc.fontSize(9)
     .fillColor(textColor)
     .text('Plot 42, Health City Sector, Suite 101\nPhone: +1 555-019-2834 | Email: billing@apexdental.com', { align: 'right' });
  
  doc.moveDown(1.5);
  
  // Horizontal divider line
  doc.strokeColor('#E2E8F0')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();
  
  doc.moveDown(1.5);

  // Invoice Meta
  const metaY = doc.y;
  doc.fillColor(primaryColor).fontSize(11).text('BILL TO', 50, metaY, { bold: true });
  doc.fillColor(textColor).fontSize(10)
     .text(`Patient Name: ${invoice.patient.name}`, 50, metaY + 15)
     .text(`ID: ${invoice.patient.patientId}`, 50, metaY + 30)
     .text(`Contact: ${invoice.patient.contactNumber}`, 50, metaY + 45);

  doc.fillColor(primaryColor).fontSize(11).text('INVOICE DETAILS', 300, metaY, { bold: true });
  doc.fillColor(textColor).fontSize(10)
     .text(`Invoice No: ${invoice.invoiceNumber}`, 300, metaY + 15)
     .text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 300, metaY + 30)
     .text(`Payment Status: ${invoice.status}`, 300, metaY + 45)
     .text(`Payment Method: ${invoice.paymentMethod}`, 300, metaY + 60);

  doc.moveDown(5.5);

  // Items Table Header
  const tableTop = doc.y;
  doc.rect(50, tableTop, 495, 20).fill('#F1F5F9');
  doc.fillColor(primaryColor).fontSize(10)
     .text('Description / Procedure', 60, tableTop + 5, { bold: true })
     .text('Base Cost', 260, tableTop + 5, { bold: true })
     .text('GST Rate', 350, tableTop + 5, { bold: true })
     .text('Amount (Inc. GST)', 440, tableTop + 5, { bold: true, align: 'right', width: 95 });

  let currentY = tableTop + 25;

  // Invoice Items
  invoice.items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.rect(50, currentY - 2, 495, 20).fill('#F8FAFC');
    }
    
    doc.fillColor(primaryColor).fontSize(9).text(item.description, 60, currentY);
    doc.fillColor(textColor)
       .text(`$${item.cost.toFixed(2)}`, 260, currentY)
       .text(`${item.gstPercent}%`, 350, currentY)
       .text(`$${item.amount.toFixed(2)}`, 440, currentY, { align: 'right', width: 95 });

    currentY += 22;
  });

  doc.y = currentY + 15;

  // Horizontal line
  doc.strokeColor('#E2E8F0')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();

  doc.moveDown(1);

  // Totals calculations aligned right
  const totalsY = doc.y;
  doc.fillColor(textColor).fontSize(10)
     .text('Subtotal:', 300, totalsY, { align: 'right', width: 140 })
     .text(`$${(invoice.totalAmount - invoice.totalGst).toFixed(2)}`, 440, totalsY, { align: 'right', width: 95 });

  doc.text('Total GST (Integrated):', 300, totalsY + 15, { align: 'right', width: 140 })
     .text(`$${invoice.totalGst.toFixed(2)}`, 440, totalsY + 15, { align: 'right', width: 95 });

  doc.fillColor(primaryColor).fontSize(11)
     .text('Grand Total:', 300, totalsY + 30, { align: 'right', width: 140, bold: true })
     .text(`$${invoice.totalAmount.toFixed(2)}`, 440, totalsY + 30, { align: 'right', width: 95, bold: true });

  doc.strokeColor('#E2E8F0')
     .lineWidth(1)
     .moveTo(350, totalsY + 47)
     .lineTo(545, totalsY + 47)
     .stroke();

  doc.fillColor(textColor).fontSize(10)
     .text('Paid Amount:', 300, totalsY + 52, { align: 'right', width: 140 })
     .text(`$${invoice.paidAmount.toFixed(2)}`, 440, totalsY + 52, { align: 'right', width: 95 });

  doc.fillColor(invoice.dueAmount > 0 ? '#B91C1C' : '#15803D') // Red if due, Green if paid
     .fontSize(11)
     .text('Balance Due:', 300, totalsY + 67, { align: 'right', width: 140, bold: true })
     .text(`$${invoice.dueAmount.toFixed(2)}`, 440, totalsY + 67, { align: 'right', width: 95, bold: true });

  // Thank you terms
  doc.y = totalsY + 110;
  doc.fillColor(primaryColor).fontSize(10).text('Terms & Instructions:', 50, doc.y, { bold: true });
  doc.fillColor(textColor).fontSize(9)
     .text('1. Payment is due upon receipt unless insurance claim status is approved.\n2. Please mention Invoice Number on payment wire transfers.\n3. Keep this copy for tax filing / GST refund claims.', 50, doc.y + 15);

  // Footer Signature
  const footerSigY = 720;
  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, footerSigY - 10).lineTo(545, footerSigY - 10).stroke();
  doc.fillColor(textColor).fontSize(8).text('Thank you for choosing Apex Dental Care for your oral health needs.', 50, footerSigY, { align: 'left' });
  doc.text('Authorized Billing Stamp', 400, footerSigY, { align: 'right' });

  doc.end();
};

// Simple helper to calculate age
function calculateAge(birthday) {
  const ageDifMs = Date.now() - new Date(birthday).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = {
  generatePrescriptionPDF,
  generateInvoicePDF,
};
