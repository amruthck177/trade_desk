import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Compiles job details into an A4 PDF and saves it locally.
 * Returns the absolute path and public URL.
 */
export const generateInvoicePDF = async (job, user, invoiceNumber) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      
      const fileName = `invoice-${invoiceNumber}.pdf`;
      const filePath = path.join('./uploads/invoices', fileName);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);
      
      const primaryColor = '#F97316'; // Orange accent
      const darkColor = '#0A0F1E';
      const textGray = '#4B5563';
      const lineGray = '#E5E7EB';
      
      // Draw border
      doc.rect(20, 20, 555, 802).lineWidth(1).stroke('#F97316');
      
      // Header Logo
      if (user.logoUrl && fs.existsSync(user.logoUrl)) {
        doc.image(user.logoUrl, 40, 40, { width: 60 });
        doc.font('Helvetica-Bold').fontSize(22).fillColor(darkColor).text(user.businessName || user.name, 110, 45);
      } else {
        doc.font('Helvetica-Bold').fontSize(24).fillColor(primaryColor).text(user.businessName || 'TradeDesk', 40, 45);
      }
      
      // Vendor Info
      doc.font('Helvetica-Bold').fontSize(10).fillColor(darkColor).text('INVOICE VENDOR', 400, 45);
      doc.font('Helvetica').fontSize(9).fillColor(textGray);
      doc.text(`Name: ${user.name}`, 400, 60);
      if (user.phone) doc.text(`Phone: ${user.phone}`, 400, 72);
      if (user.gstNumber) doc.text(`GSTIN: ${user.gstNumber}`, 400, 84);
      
      // Divider
      doc.moveTo(40, 110).lineTo(555, 110).lineWidth(1).stroke(lineGray);
      
      // Invoice Details
      doc.font('Helvetica-Bold').fontSize(12).fillColor(darkColor).text(`INVOICE: ${invoiceNumber}`, 40, 130);
      doc.font('Helvetica').fontSize(9).fillColor(textGray);
      doc.text(`Date: ${new Date(job.createdAt).toLocaleDateString()}`, 40, 147);
      
      // Status Tag
      const statusLabel = job.status.toUpperCase();
      const statusColor = job.status === 'paid' ? '#22C55E' : '#EF4444';
      doc.rect(40, 162, 70, 16).fill(statusColor);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF').text(statusLabel, 45, 166, { width: 60, align: 'center' });
      
      // Client Info
      doc.font('Helvetica-Bold').fontSize(10).fillColor(darkColor).text('BILL TO', 400, 130);
      doc.font('Helvetica').fontSize(9).fillColor(textGray);
      doc.text(`Name: ${job.clientName}`, 400, 145);
      doc.text(`Phone: ${job.clientPhone}`, 400, 157);
      
      doc.moveTo(40, 195).lineTo(555, 195).lineWidth(1).stroke(lineGray);
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(darkColor).text(`Job details: ${job.jobTitle}`, 40, 210);
      
      // Items Table
      let y = 240;
      doc.rect(40, y, 515, 20).fill('#F3F4F6');
      doc.font('Helvetica-Bold').fontSize(9).fillColor(darkColor);
      doc.text('Item Description', 45, y + 6);
      doc.text('Rate', 320, y + 6);
      doc.text('Qty/Hrs', 410, y + 6);
      doc.text('Total', 490, y + 6);
      
      y += 20;
      doc.font('Helvetica').fontSize(9).fillColor(textGray);
      
      if (job.laborHours > 0) {
        y += 5;
        doc.text('Labor / Service Charges', 45, y);
        doc.text(`Rs. ${job.hourlyRate.toFixed(2)}`, 320, y);
        doc.text(`${job.laborHours} hrs`, 410, y);
        const laborTotal = job.laborHours * job.hourlyRate;
        doc.text(`Rs. ${laborTotal.toFixed(2)}`, 490, y);
        y += 15;
        doc.moveTo(40, y).lineTo(555, y).lineWidth(0.5).stroke(lineGray);
      }
      
      job.materials.forEach(mat => {
        y += 5;
        doc.text(mat.name, 45, y);
        doc.text(`Rs. ${mat.price.toFixed(2)}`, 320, y);
        doc.text('1', 410, y);
        doc.text(`Rs. ${mat.price.toFixed(2)}`, 490, y);
        y += 15;
        doc.moveTo(40, y).lineTo(555, y).lineWidth(0.5).stroke(lineGray);
      });
      
      // Totals
      y += 10;
      doc.font('Helvetica').fontSize(9).fillColor(textGray);
      doc.text('Subtotal:', 380, y);
      doc.font('Helvetica-Bold').fillColor(darkColor).text(`Rs. ${job.subtotal.toFixed(2)}`, 490, y);
      
      y += 15;
      doc.font('Helvetica').fillColor(textGray).text(`GST (${job.gstRate}%):`, 380, y);
      doc.font('Helvetica-Bold').fillColor(darkColor).text(`Rs. ${job.gstAmount.toFixed(2)}`, 490, y);
      
      y += 15;
      doc.rect(370, y - 4, 185, 22).fill('#FFF7ED');
      doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('Total Bill:', 380, y + 2);
      doc.text(`Rs. ${job.totalBill.toFixed(2)}`, 490, y + 2);
      
      // Watermark
      if (job.status === 'paid') {
        doc.save();
        doc.opacity(0.12);
        doc.fontSize(72).font('Helvetica-Bold').fillColor('#22C55E');
        doc.rotate(-30, { origin: [300, 450] });
        doc.text('PAID IN FULL', 160, 450);
        doc.restore();
      }
      
      // UPI QR
      y += 45;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(darkColor).text('PAYMENT DETAILS', 40, y);
      doc.font('Helvetica').fontSize(9).fillColor(textGray);
      if (user.upiId) {
        doc.text(`UPI VPA: ${user.upiId}`, 40, y + 15);
        doc.text('Scan below QR using any UPI app (GPay/PhonePe/Paytm) to pay:', 40, y + 27);
        
        const qrY = y + 42;
        doc.rect(40, qrY, 70, 70).lineWidth(1.5).stroke('#111827');
        doc.rect(45, qrY + 5, 20, 20).fill('#111827');
        doc.rect(85, qrY + 5, 20, 20).fill('#111827');
        doc.rect(45, qrY + 45, 20, 20).fill('#111827');
        doc.rect(70, qrY + 30, 15, 15).fill('#111827');
        doc.rect(85, qrY + 45, 10, 10).fill('#111827');
      } else {
        doc.text('No UPI VPA configured. Please settle payment with the vendor directly.', 40, y + 15);
      }
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(primaryColor).text('TradeDesk - Turn Voice Into Invoice', 40, 770, { align: 'center' });
      doc.font('Helvetica').fontSize(7).fillColor(textGray).text('This is an AI-assisted GST-compliant invoice generated dynamically.', 40, 782, { align: 'center' });
      
      doc.end();
      
      writeStream.on('finish', () => {
        resolve({
          filePath,
          publicUrl: `/uploads/invoices/${fileName}`
        });
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
      
    } catch (err) {
      reject(err);
    }
  });
};
