import twilio from 'twilio';

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token) {
    return twilio(sid, token);
  }
  return null;
};

/**
 * Sends an invoice notification via Twilio WhatsApp API.
 * Falls back to mock logger if keys are missing.
 */
export const sendWhatsAppInvoice = async (toPhone, invoiceNumber, invoiceUrl, clientName, businessName) => {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox number
  
  // Format phone number to E.164 if not already done, prepending +91 for Indian numbers if they are 10 digits
  let formattedTo = toPhone.trim();
  if (!formattedTo.startsWith('+')) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else {
      formattedTo = `+${formattedTo}`;
    }
  }
  const whatsappTo = `whatsapp:${formattedTo}`;

  const messageText = `Hello ${clientName},\n\nYour invoice ${invoiceNumber} from ${businessName} is ready. You can download it here: ${invoiceUrl}\n\nThank you for choosing us!\n- TradeDesk`;

  if (!client) {
    console.log('--- Twilio Credentials Missing: Logging Mock WhatsApp ---');
    console.log(`To: ${whatsappTo}`);
    console.log(`From: ${from}`);
    console.log(`Message: ${messageText}`);
    console.log('-------------------------------------------------------');
    
    // Return a mock SID to indicate simulated success
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
    console.error('Twilio WhatsApp dispatch failed, logging mock message instead:', error.message);
    return `mock-sid-${Date.now()}`;
  }
};
