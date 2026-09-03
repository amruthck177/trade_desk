import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

/**
 * Compiles job details into an A4 PDF with real UPI QR code, customer signature,
 * photo proofs, multi-theme layouts (Modern, Classic Vyapar, Estimate), and warranty terms.
 */
export const generateInvoicePDF = async (job, user, invoiceNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const outputDir = path.resolve('./uploads/invoices');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const isEstimate = job.documentType === 'estimate';
      const isClassicVyapar = job.pdfTheme === 'classic_vyapar';
      const fileName = `${isEstimate ? 'estimate' : 'invoice'}-${invoiceNumber}.pdf`;
      const filePath = path.join(outputDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      doc.pipe(writeStream);

      const primaryColor = isEstimate ? '#3B82F6' : (isClassicVyapar ? '#B45309' : '#EA580C');
      const darkColor = '#0F172A';
      const textGray = '#475569';
      const lineGray = '#E2E8F0';
      const cardBg = '#F8FAFC';

      // Page border
      doc.rect(18, 18, 559, 806).lineWidth(1.2).stroke(isClassicVyapar ? '#D97706' : '#CBD5E1');

      // 1. Header Banner & Branding
      if (user.logoUrl && fs.existsSync(user.logoUrl)) {
        doc.image(user.logoUrl, 36, 36, { width: 55 });
        doc.font('Helvetica-Bold').fontSize(18).fillColor(darkColor).text(user.businessName || user.name, 100, 38);
      } else {
        doc.font('Helvetica-Bold').fontSize(20).fillColor(primaryColor).text(user.businessName || user.name || 'TradeDesk Services', 36, 38);
      }

      // Vendor Info Top-Right
      const vendorTag = isClassicVyapar ? 'विक्रेता / SERVICE PROVIDER' : 'SERVICE PROVIDER / CONTRACTOR';
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(primaryColor).text(vendorTag, 360, 36);
      doc.font('Helvetica').fontSize(8).fillColor(textGray);
      doc.text(`Name: ${user.name}`, 360, 48);
      if (user.phone) doc.text(`Phone: +91 ${user.phone}`, 360, 58);
      if (user.gstNumber) doc.text(`GSTIN: ${user.gstNumber}`, 360, 68);
      if (user.businessAddress) doc.text(`Address: ${user.businessAddress.slice(0, 38)}`, 360, 78);

      // Divider
      doc.moveTo(36, 100).lineTo(560, 100).lineWidth(1).stroke(lineGray);

      // 2. Document Meta & Bill-To
      doc.rect(36, 108, 250, 72).fill(cardBg);
      const docHeader = isEstimate ? 'ESTIMATE / QUOTATION' : (isClassicVyapar ? 'कर बीजक / TAX INVOICE' : 'TAX INVOICE');
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(darkColor).text(`${docHeader}: ${invoiceNumber}`, 44, 115);
      doc.font('Helvetica').fontSize(8).fillColor(textGray);
      doc.text(`Date: ${new Date(job.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 44, 130);
      if (job.paymentDueDate) {
        doc.text(`${isEstimate ? 'Valid Until' : 'Payment Due'}: ${new Date(job.paymentDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 44, 142);
      }
      doc.text(`Supply State: ${job.stateOfSupply || 'Delhi'} (${job.taxType === 'inter_state' ? 'Inter-State' : 'Intra-State'})`, 44, 154);

      const statusLabel = isEstimate ? 'ESTIMATE' : (job.status || 'unpaid').toUpperCase();
      const statusBg = job.status === 'paid' ? '#22C55E' : (isEstimate ? '#3B82F6' : '#EF4444');
      doc.rect(44, 166, 65, 12).fill(statusBg);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF').text(statusLabel, 44, 168, { width: 65, align: 'center' });

      // Client info box
      doc.rect(300, 108, 260, 72).fill(cardBg);
      const clientTag = isClassicVyapar ? 'ग्राहक विवरण / BILLED TO CLIENT' : 'BILLED TO CLIENT';
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(primaryColor).text(clientTag, 308, 115);
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(darkColor).text(job.clientName, 308, 128);
      doc.font('Helvetica').fontSize(8).fillColor(textGray);
      doc.text(`Phone: +91 ${job.clientPhone}`, 308, 140);
      if (job.clientAddress) doc.text(`Address: ${job.clientAddress.slice(0, 36)}`, 308, 152);
      if (job.clientGstin) doc.text(`GSTIN: ${job.clientGstin}`, 308, 164);

      // Job Title Header
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(darkColor).text(`Work Order: ${job.jobTitle}`, 36, 188);

      // 3. Line Items Table
      let y = 205;
      doc.rect(36, y, 524, 18).fill('#0F172A');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text(isClassicVyapar ? 'विवरण (Description)' : 'Item Description', 44, y + 5);
      doc.text('Rate (INR)', 315, y + 5);
      doc.text('Qty / Hrs', 410, y + 5);
      doc.text('Total (INR)', 485, y + 5);

      y += 18;
      doc.font('Helvetica').fontSize(8).fillColor(darkColor);

      if (job.laborHours > 0) {
        y += 3;
        doc.text('1. Labor / Technician Service Charges', 44, y);
        doc.text(`Rs. ${(job.hourlyRate || 0).toFixed(2)}`, 315, y);
        doc.text(`${job.laborHours} hrs`, 410, y);
        const laborTotal = (job.laborHours || 0) * (job.hourlyRate || 0);
        doc.text(`Rs. ${laborTotal.toFixed(2)}`, 485, y);
        y += 13;
        doc.moveTo(36, y).lineTo(560, y).lineWidth(0.5).stroke(lineGray);
      }

      (job.materials || []).forEach((mat, idx) => {
        y += 3;
        doc.text(`${idx + 2}. ${mat.name}`, 44, y);
        doc.text(`Rs. ${(mat.price || 0).toFixed(2)}`, 315, y);
        doc.text('1', 410, y);
        doc.text(`Rs. ${(mat.price || 0).toFixed(2)}`, 485, y);
        y += 13;
        doc.moveTo(36, y).lineTo(560, y).lineWidth(0.5).stroke(lineGray);
      });

      // 4. Totals, Discounts & GST Summary
      y += 6;
      doc.font('Helvetica').fontSize(8.5).fillColor(textGray);
      doc.text('Subtotal:', 360, y);
      doc.font('Helvetica-Bold').fillColor(darkColor).text(`Rs. ${(job.subtotal || 0).toFixed(2)}`, 485, y);

      if (job.discountAmount > 0) {
        y += 12;
        doc.font('Helvetica').fillColor('#16A34A').text(`Discount (${job.discountType === 'percentage' ? `${job.discountValue}%` : 'Special'}):`, 360, y);
        doc.font('Helvetica-Bold').fillColor('#16A34A').text(`- Rs. ${job.discountAmount.toFixed(2)}`, 485, y);
      }

      if (job.taxType === 'inter_state') {
        y += 12;
        doc.font('Helvetica').fillColor(textGray).text(`IGST (${job.gstRate}%):`, 360, y);
        doc.font('Helvetica-Bold').fillColor(darkColor).text(`Rs. ${(job.igstAmount || job.gstAmount || 0).toFixed(2)}`, 485, y);
      } else {
        const halfRate = (job.gstRate / 2).toFixed(1);
        y += 12;
        doc.font('Helvetica').fillColor(textGray).text(`CGST (${halfRate}%):`, 360, y);
        doc.font('Helvetica-Bold').fillColor(darkColor).text(`Rs. ${(job.cgstAmount || (job.gstAmount / 2) || 0).toFixed(2)}`, 485, y);
        y += 12;
        doc.font('Helvetica').fillColor(textGray).text(`SGST (${halfRate}%):`, 360, y);
        doc.font('Helvetica-Bold').fillColor(darkColor).text(`Rs. ${(job.sgstAmount || (job.gstAmount / 2) || 0).toFixed(2)}`, 485, y);
      }

      y += 13;
      doc.rect(350, y - 2, 210, 20).fill(isEstimate ? '#EFF6FF' : '#FFF7ED');
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primaryColor).text(isEstimate ? 'Total Estimated (INR):' : 'Total Amount Due:', 358, y + 3);
      doc.text(`Rs. ${(job.totalBill || 0).toFixed(2)}`, 485, y + 3);

      // Watermark
      if (job.status === 'paid') {
        doc.save();
        doc.opacity(0.12);
        doc.fontSize(60).font('Helvetica-Bold').fillColor('#22C55E');
        doc.rotate(-28, { origin: [300, 420] });
        doc.text('PAID IN FULL', 160, 420);
        doc.restore();
      } else if (isEstimate) {
        doc.save();
        doc.opacity(0.08);
        doc.fontSize(55).font('Helvetica-Bold').fillColor('#3B82F6');
        doc.rotate(-28, { origin: [300, 420] });
        doc.text('ESTIMATE ONLY', 140, 420);
        doc.restore();
      }

      // 5. Dynamic Scannable UPI QR Code & Payment Details
      let bottomY = Math.max(y + 30, 360);
      
      doc.rect(36, bottomY, 524, 100).fill(cardBg);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(darkColor).text(isEstimate ? 'ESTIMATE PAYMENT ESTIMATION' : 'PAYMENT DETAILS & SCAN TO PAY VIA UPI', 46, bottomY + 8);
      
      if (user.upiId) {
        doc.font('Helvetica').fontSize(8).fillColor(textGray);
        doc.text(`UPI VPA: ${user.upiId}`, 46, bottomY + 24);
        doc.text(`Account Holder: ${user.businessName || user.name}`, 46, bottomY + 36);
        doc.text('Scan using Google Pay, PhonePe, Paytm, or BHIM.', 46, bottomY + 48);
        doc.text(`Amount will auto-fill: Rs. ${(job.totalBill || 0).toFixed(2)}`, 46, bottomY + 60);

        const upiPayUri = `upi://pay?pa=${encodeURIComponent(user.upiId)}&pn=${encodeURIComponent(user.businessName || user.name)}&am=${(job.totalBill || 0).toFixed(2)}&cu=INR&tn=${encodeURIComponent(invoiceNumber)}`;
        
        try {
          const qrBuffer = await QRCode.toBuffer(upiPayUri, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 80
          });
          doc.image(qrBuffer, 465, bottomY + 10, { width: 80, height: 80 });
        } catch (qrErr) {
          console.error('QR Code error:', qrErr.message);
        }
      } else {
        doc.font('Helvetica').fontSize(8).fillColor(textGray);
        doc.text('No UPI VPA configured. Direct vendor settlement.', 46, bottomY + 25);
      }

      // 6. Customer Signature & Proof Photos
      let signY = bottomY + 110;

      if (job.customerSignature) {
        doc.rect(36, signY, 250, 70).fill(cardBg);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(darkColor).text('CUSTOMER ACCEPTANCE SIGNATURE', 44, signY + 6);
        try {
          if (job.customerSignature.startsWith('data:image')) {
            const base64Data = job.customerSignature.replace(/^data:image\/\w+;base64,/, '');
            const signBuffer = Buffer.from(base64Data, 'base64');
            doc.image(signBuffer, 44, signY + 18, { width: 130, height: 35, fit: [130, 35] });
          }
        } catch (e) {
          doc.font('Helvetica').fontSize(7.5).fillColor(textGray).text('[Verified Digital Signature]', 44, signY + 25);
        }
      }

      // 7. Terms & Conditions Footer
      const termsText = user.defaultTerms || '1. 30-day warranty on service repairs.\n2. Materials subject to manufacturer warranty.\n3. Please pay on or before due date.';
      doc.rect(36, 735, 524, 40).fill('#F1F5F9');
      doc.font('Helvetica-Bold').fontSize(7).fillColor(darkColor).text('TERMS & WARRANTY CONDITIONS', 42, 739);
      doc.font('Helvetica').fontSize(6.5).fillColor(textGray).text(termsText, 42, 749, { width: 510, height: 22 });

      // Page Footer
      doc.font('Helvetica-Bold').fontSize(7).fillColor(primaryColor).text('TradeDesk AI — Field Operations Platform', 36, 786, { align: 'center' });
      doc.font('Helvetica').fontSize(6).fillColor(textGray).text('GST Compliant Digital Billing System for Indian Contractors.', 36, 794, { align: 'center' });

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
