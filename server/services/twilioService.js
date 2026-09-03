import twilio from 'twilio';

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token) {
    return twilio(sid, token);
  }
  return null;
};

const formatToWhatsAppNumber = (phone) => {
  let formattedTo = (phone || '').trim();
  if (!formattedTo.startsWith('+')) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else {
      formattedTo = `+${formattedTo}`;
    }
  }
  return `whatsapp:${formattedTo}`;
};

/**
 * Sends an invoice notification via Twilio WhatsApp API.
 */
export const sendWhatsAppInvoice = async (toPhone, invoiceNumber, invoiceUrl, clientName, businessName) => {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const whatsappTo = formatToWhatsAppNumber(toPhone);

  const messageText = `Namaste ${clientName},\n\nYour bill *${invoiceNumber}* from *${businessName}* is ready.\n\n📄 View Invoice & Pay UPI: ${invoiceUrl}\n\nThank you for choosing our services!\n— Powered by TradeDesk AI 🛠️`;

  if (!client) {
    console.log('--- Twilio Credentials Missing: Logging Mock WhatsApp ---');
    console.log(`To: ${whatsappTo}`);
    console.log(`From: ${from}`);
    console.log(`Message: ${messageText}`);
    console.log('-------------------------------------------------------');
    return `mock-sid-${Date.now()}`;
  }

  try {
    const message = await client.messages.create({
      body: messageText,
      from,
      to: whatsappTo,
    });
    return message.sid;
  } catch (error) {
    console.error('Twilio WhatsApp dispatch error, using fallback:', error.message);
    return `mock-sid-${Date.now()}`;
  }
};

/**
 * Sends a tiered payment reminder via WhatsApp (Polite, Due Day, Urgent).
 */
export const sendWhatsAppReminder = async (toPhone, invoiceNumber, totalBill, invoiceUrl, clientName, businessName, tier = 'tier1_polite') => {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const whatsappTo = formatToWhatsAppNumber(toPhone);

  let messageText = '';
  if (tier === 'tier3_urgent') {
    messageText = `⚠️ *URGENT OVERDUE PAYMENT NOTICE*\n\nNamaste ${clientName},\nYour invoice *${invoiceNumber}* for *₹${totalBill.toFixed(2)}* from *${businessName}* is critically overdue.\n\n👉 Kindly settle immediately via UPI: ${invoiceUrl}\n\nPlease ignore if already paid.`;
  } else if (tier === 'tier2_due') {
    messageText = `🔔 *PAYMENT DUE TODAY*\n\nNamaste ${clientName},\nThis is a reminder that invoice *${invoiceNumber}* for *₹${totalBill.toFixed(2)}* from *${businessName}* is due today.\n\n📲 Pay online via GPay/PhonePe/Paytm: ${invoiceUrl}\nThank you! 🙏`;
  } else {
    // tier1_polite
    messageText = `Namaste ${clientName},\n\nThis is a friendly reminder regarding pending payment of *₹${totalBill.toFixed(2)}* for invoice *${invoiceNumber}* from *${businessName}*.\n\n📄 View Invoice & Pay: ${invoiceUrl}\n\nThank you for your cooperation! 🙏`;
  }

  if (!client) {
    console.log(`--- Twilio Reminder [${tier}] (Simulated) ---`);
    console.log(`To: ${whatsappTo}`);
    console.log(`Message: ${messageText}`);
    console.log('--------------------------------------------');
    return `mock-reminder-sid-${Date.now()}`;
  }

  try {
    const message = await client.messages.create({
      body: messageText,
      from,
      to: whatsappTo,
    });
    return message.sid;
  } catch (error) {
    console.error('Twilio reminder dispatch failed:', error.message);
    return `mock-reminder-sid-${Date.now()}`;
  }
};
