import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Ensure uploads folder exists
const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const outputPath = path.join(uploadsDir, 'TradeDesk_UIUX_Master_Specification.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  bufferPages: true,
  autoFirstPage: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

const primaryOrange = '#EA580C';
const darkNavy = '#0A0F1E';
const cardNavy = '#111827';
const textWhite = '#0F172A';
const textSlate = '#334155';
const textMuted = '#64748B';
const borderGray = '#CBD5E1';
const bgLight = '#F8FAFC';
const successGreen = '#16A34A';

function checkPageSpace(doc, requiredHeight = 80) {
  if (doc.y + requiredHeight > 780) {
    doc.addPage();
  }
}

function drawSectionHeader(title, subtitle) {
  checkPageSpace(doc, 60);
  doc.moveDown(0.5);
  const currentY = doc.y;
  
  // Left orange accent bar
  doc.rect(40, currentY, 4, 22).fill(primaryOrange);
  
  doc.font('Helvetica-Bold').fontSize(14).fillColor(darkNavy).text(title, 52, currentY + 3);
  if (subtitle) {
    doc.font('Helvetica').fontSize(9).fillColor(textMuted).text(subtitle, 52, currentY + 22);
    doc.y = currentY + 36;
  } else {
    doc.y = currentY + 26;
  }
  doc.moveDown(0.3);
}

function drawBox(title, contentArray, width = 515) {
  checkPageSpace(doc, contentArray.length * 14 + 40);
  const startY = doc.y;
  
  doc.font('Helvetica-Bold').fontSize(10).fillColor(darkNavy);
  const titleHeight = 18;
  
  doc.font('Helvetica').fontSize(8.5).fillColor(textSlate);
  const textHeight = contentArray.length * 13;
  const totalHeight = titleHeight + textHeight + 16;
  
  doc.rect(40, startY, width, totalHeight).fillAndStroke('#F1F5F9', borderGray);
  doc.rect(40, startY, width, 22).fill('#E2E8F0');
  
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(darkNavy).text(title, 48, startY + 6);
  
  let textY = startY + 28;
  contentArray.forEach(line => {
    doc.font('Helvetica').fontSize(8.5).fillColor(textSlate).text(line, 48, textY, { width: width - 16 });
    textY += 13;
  });
  
  doc.y = startY + totalHeight + 8;
}

// ─────────────────────────────────────────────────────────────
// PAGE 1: TITLE & COVER HEADER
// ─────────────────────────────────────────────────────────────

// Header Banner
doc.rect(40, 40, 515, 75).fill(darkNavy);
doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFFFFF').text('TradeDesk AI', 56, 52);
doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryOrange).text('Product Vision & UI/UX Master Specification', 56, 78);
doc.font('Helvetica').fontSize(8.5).fillColor('#94A3B8').text('Complete Design System, User Flows & Screen Wireframes • Target: Field Technicians in India', 56, 92);

doc.y = 128;

// 1. Core Problem & Solution
drawSectionHeader('1. Executive Summary & Value Proposition');

drawBox('The Core Problem', [
  '• Manual Paperwork & Lost Revenue: Field technicians finish jobs on-site and write rough paper estimates or forget parts.',
  '• Payment Delays & Uncollected Cash: Technicians lack instant invoicing or follow-up methods, leading to 20-30% delayed bills.',
  '• Complicated Accounting Software: Legacy tools (Tally, Zoho) are built for desktop accountants, not technicians on mobile.'
]);

drawBox('The TradeDesk Solution', [
  '1. Multilingual Voice AI: Technician speaks naturally in Hindi, English, or Hinglish to describe work, parts, and rates.',
  '2. Instant GST Invoicing: Automatically calculates labor, materials, and GST taxes into a professional A4 PDF.',
  '3. Dynamic Scannable UPI QR Code: Pre-fills the exact bill amount on customer\'s Google Pay / PhonePe / Paytm.',
  '4. Instant WhatsApp Delivery: In 1 click, the PDF invoice and payment link are delivered directly to the client\'s WhatsApp.',
  '5. 1-Click Tax Filing: Exports monthly invoices formatted for GSTR-1 GST accounting.'
]);

// 2. Design System & Visual Tokens
drawSectionHeader('2. Design System & Visual Foundations');

drawBox('Color Tokens & Semantic Palette', [
  '• Background Primary: #0A0F1E (Deep Space Navy - Dark, sleek, glare-free in bright daylight)',
  '• Elevated Card Surface: #111827 / #1F2937 (Frosted surface with #374151 borders)',
  '• Brand Primary Accent: #EA580C / #F97316 (Electric Sunset Orange - High visual prominence)',
  '• Success Green: #22C55E (Paid status, lifetime value, positive growth badges)',
  '• Danger Red: #EF4444 (Unpaid status, delete triggers, mic recording active pulse)',
  '• Warning Amber: #F59E0B (Follow-ups due, overdue payment reminder alerts)',
  '• Typography: Syne/Outfit (Display Headings), DM Sans/Inter (Body/Labels), JetBrains Mono (Financial & Phone data)'
]);

// 3. Navigation Shell
drawSectionHeader('3. App Navigation Architecture');
drawBox('Dual Navigation Strategy', [
  '• Desktop / Tablet Shell: Collapsible 240px sidebar with Logo, Dashboard, Invoices, Customers CRM, Rate Cards, Settings.',
  '• Mobile Experience (< 768px): Sticky frosted topbar + Bottom navigation bar with central raised Orange Circular Mic FAB.',
  '• Mobile-First PWA: Installable directly to Android and iOS home screens with full offline draft caching capabilities.'
]);

// ─────────────────────────────────────────────────────────────
// SCREEN-BY-SCREEN SPECIFICATIONS
// ─────────────────────────────────────────────────────────────
doc.addPage();

drawSectionHeader('4. Screen-by-Screen UI/UX Specifications', 'Screen 1: Voice-to-Invoice Creation Wizard (/jobs/new)');

drawBox('Step 1: Voice Recording Screen', [
  '• Large Central Pulsating Microphone Button: 112px circular touch target with animated ripple rings.',
  '• Live Equalizer Waveform & Timer: Animated jumping audio bars and MM:SS ticker during active recording.',
  '• Real MediaRecorder API: Directly records microphone audio in .webm/.wav format with replay and re-record options.',
  '• AI Multilingual Speech Parser: Extracts client name, 10-digit phone, job title, hours, rate, materials, and GST.'
]);

drawBox('Step 2: AI Review, Signature & Customization', [
  '• AI Transcript Preview: Displays raw speech with highlighted structured entity badges.',
  '• Client Information: Customer Name, Phone (+91), Service Address, and B2B Client GSTIN.',
  '• Work & Labor Card: Work title with Quick-Add dropdown to inject items from saved Rate Card catalog.',
  '• Materials & Spare Parts: Line-item editor with real-time price calculations.',
  '• GST Rate Selector: Dropdown for 0% (Nil), 5%, 12%, 18% (Standard), and 28%.',
  '• Digital Signature Canvas: Touch and stylus signature pad for instant customer job acceptance sign-off.',
  '• Real-time Financial Breakdown: Labor + Materials + GST = Total Bill Amount (INR).'
]);

drawBox('Step 3: Success & WhatsApp Dispatch', [
  '• Success Card: Green animated verification icon and generated invoice number (e.g. INV-484353).',
  '• 1-Click WhatsApp Delivery: Sends formatted message with direct PDF download link to client mobile.',
  '• Secondary Actions: Direct PDF download and Live Invoice preview link.'
]);

drawSectionHeader('Screen 2: Live Digital A4 Invoice & Payment Sheet (/invoices/:id)');

drawBox('A4 Digital Invoice Layout & Payment Engine', [
  '• Vendor & Branding Header: Custom business logo, technician name, phone, GSTIN, and business address.',
  '• Client & Invoice Meta: Invoice number, issue date, payment due date, client name, and phone number.',
  '• Itemized Service Breakdown Table: Description, Rate/Unit, Quantity/Hours, Total Amount.',
  '• Dynamic Scannable UPI QR Code: High-resolution QR code generated with upi://pay deep link pre-filling total bill.',
  '• Mobile UPI Intent Button: "Open in UPI App" button to directly launch GPay / PhonePe / Paytm on client phone.',
  '• Verified Digital Signature Block: Displays customer signature stamped during work sign-off.',
  '• Terms & Warranty Footer: Configurable 30-day workmanship warranty and manufacturer parts terms.',
  '• Action Toolbar: Paid/Unpaid toggle badge, Send WhatsApp Reminder, Download PDF.'
]);

// ─────────────────────────────────────────────────────────────
// CRM, RATE CARDS & DASHBOARD
// ─────────────────────────────────────────────────────────────
doc.addPage();

drawSectionHeader('Screen 3: Customer Mini-CRM & Client Directory (/customers)');

drawBox('Customer Management Features', [
  '• Client Directory Search: Instant filtering by client name, 10-digit phone number, or address.',
  '• Dual Column View: Client cards on the left showing total jobs counter and lifetime revenue in rupees.',
  '• Customer Detail Drawer: Detailed service address, custom notes, lifetime spend, and clickable job history timeline.',
  '• Direct WhatsApp Launcher: 1-click button to open WhatsApp chat with any customer.',
  '• Auto-Sync Engine: Creating or updating an invoice automatically syncs/updates customer CRM records.'
]);

drawSectionHeader('Screen 4: Rate Cards & Materials Catalog (/catalog)');

drawBox('Rate Cards & Pricing Master', [
  '• Category Filtering Tabs: All Items, Services, Labor, Materials & Parts.',
  '• Preset Trade Templates: 1-click auto-loader for AC gas charging, plumbing leaks, MCB switches, and ceiling fans.',
  '• Card Attributes: Item title, category tag, default standard rate (INR), billing unit, and applicable GST rate.',
  '• Invoice Quick Add: Injected directly into New Job line items in 1 click without manual typing.'
]);

drawSectionHeader('Screen 5: Technician Command Center Dashboard (/dashboard)');

drawBox('Dashboard Analytics & Actions', [
  '• 4 Core KPI Stat Cards: Jobs Today, Month Revenue (Paid INR), Pending Bills (Awaiting payment), Follow-ups Due (>3 days).',
  '• Interactive 7-Day Revenue Trend Chart: Dynamic bars visualizing daily revenue with hover price tooltips.',
  '• 1-Click GSTR-1 CSV Export: Generates formatted CSV file with B2B/B2C, GSTIN, CGST, SGST, and Taxable Values for accountants.',
  '• Overdue Invoice Alert Widgets: Highlights unpaid invoices with 1-click WhatsApp payment reminder buttons.'
]);

drawSectionHeader('Screen 6: Business Settings & PDF Customizer (/settings)');

drawBox('Settings & Branding Configuration', [
  '• Profile Management: Full name, mobile number, password reset.',
  '• Business Branding: Custom logo image upload (rendered in PDF header), shop name, GSTIN number, invoice prefix.',
  '• UPI VPA Configuration: Setup technician UPI ID (e.g. yourname@okaxis) for dynamic QR code generation.',
  '• Default Warranty & Terms: Configurable footer clauses for all issued invoices.'
]);

// ─────────────────────────────────────────────────────────────
// FIELD-READY UX HIGHLIGHTS
// ─────────────────────────────────────────────────────────────
drawSectionHeader('5. Key Field-Ready UX Principles');

drawBox('Why This UX Wins for Field Contractors', [
  '1. Designed for "Dirty Hands": Large buttons, big touch targets, and voice-first inputs minimize typing on site.',
  '2. Zero Accounting Jargon: Plain words (Labor Hours, Rate, Parts Bought, GST) instead of double-entry ledger complexities.',
  '3. Frictionless Customer Payment: Dynamic UPI QR code auto-fills exact amount on GPay/PhonePe to eliminate price haggling.',
  '4. Instant WhatsApp Workflow: No email friction — everything operates natively over WhatsApp.',
  '5. Instant Compliance: GSTR-1 CSV export makes tax filing seamless for local Indian accountants.'
]);

// Footer on all pages
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(primaryOrange).text(
    'TradeDesk — Product Vision & UI/UX Master Specification',
    40,
    810,
    { align: 'left' }
  );
  doc.font('Helvetica').fontSize(7.5).fillColor(textMuted).text(
    `Page ${i + 1} of ${totalPages}`,
    40,
    810,
    { align: 'right' }
  );
}

doc.end();

writeStream.on('finish', () => {
  console.log('✅ UI/UX Master Specification PDF Generated Successfully!');
  console.log(`File saved at: ${outputPath}`);
});
