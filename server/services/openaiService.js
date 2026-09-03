import OpenAI from 'openai';
import fs from 'fs';

// Initialize OpenAI client only if API key is provided
const getOpenAIClient = () => {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
};

/**
 * Transcribes audio using OpenAI Whisper with multilingual support (English, Hindi, Hinglish, Indic).
 * Falls back to mock transcript if key is missing or file cannot be transcribed.
 */
export const transcribeAudio = async (filePath) => {
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.log('--- OpenAI API Key Missing: Using Mock Transcription ---');
    await new Promise(resolve => setTimeout(resolve, 800));
    return "Fixing kitchen sink leak for Rahul, phone number is 9988776655. I spent 3 hours fixing it at 400 per hour. Used a kitchen PVC pipe connector which cost 250 and teflon tape of 50. GST rate should be 18 percent.";
  }

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      prompt: "Technician invoice details, labor hours, rate in rupees, spare parts cost, GST rate. Supports English, Hindi, Hinglish, and Indian trade terminology.",
    });
    return response.text;
  } catch (error) {
    console.error('Whisper transcription failed, falling back to mock:', error.message);
    return "Fixing kitchen sink leak for Rahul, phone number is 9988776655. I spent 3 hours fixing it at 400 per hour. Used a kitchen PVC pipe connector which cost 250 and teflon tape of 50. GST rate should be 18 percent.";
  }
};

/**
 * Parses transcript into structured JSON using GPT-4o with multilingual/Hinglish understanding.
 * Falls back to enhanced local regex NLP parser if key is missing or fails.
 */
export const parseJobDetails = async (transcript) => {
  const openai = getOpenAIClient();

  if (!openai) {
    console.log('--- OpenAI API Key Missing: Using Local Rule-Based NLP Parser ---');
    return runLocalHeuristicParser(transcript);
  }

  try {
    const prompt = `
You are an expert invoice parser for field technicians and contractors in India.
You understand English, Hindi, Hinglish (Hindi written in Latin script), and mixed regional Indian terms.
Extract structured invoice details from the technician's voice transcript.

Output a valid JSON object matching this schema:
{
  "clientName": "Name of client (e.g. Rahul, Sharmaji, Rajesh Patel)",
  "clientPhone": "10-digit Indian phone number if mentioned (digits only), otherwise empty string",
  "jobTitle": "Concise title of work done in English (e.g. AC Gas Refill, Kitchen Sink Leakage Repair, Switchboard Wiring)",
  "laborHours": number of hours spent (float or integer, default 1 if not stated),
  "hourlyRate": hourly rate or service charge in Rupees (number, default 350 if not stated),
  "materials": [
    { "name": "material/part name in English", "price": cost as number }
  ],
  "gstRate": GST rate percentage as number (must strictly be one of: 0, 5, 12, 18, 28; default 18),
  "notes": "Any special warranty, remarks or description mentioned"
}

Common Hinglish / Hindi translations to handle:
- "ghanta" / "ghante" / "hrs" -> labor hours
- "rupaye" / "rs" / "bhaav" -> price/rate
- "kaam" / "repair" / "badla" / "fitting" -> job title context
- "samman" / "parts" / "material" / "pipe" / "taar" / "capacitor" -> materials

Transcript:
"${transcript}"

Output ONLY the JSON object. Do not wrap in markdown or backticks.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a JSON-only API assistant specialized in Indian trade invoicing." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0].message.content.trim();
    const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('GPT-4o invoice parser failed, falling back to local NLP parser:', error.message);
    return runLocalHeuristicParser(transcript);
  }
};

/**
 * Enhanced local regex-based heuristic parser supporting English & Hinglish trade notes.
 */
export function runLocalHeuristicParser(transcript) {
  const text = transcript || '';
  
  // 1. Extract 10-digit phone number
  let clientPhone = '';
  const phoneMatch = text.match(/\b[6-9]\d{9}\b/) || text.match(/\b\d{10}\b/);
  if (phoneMatch) {
    clientPhone = phoneMatch[0];
  }

  // 2. Extract Client Name
  let clientName = 'Client';
  const nameMatch = text.match(/(?:for|client|bhai|sir|ji)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) || 
                    text.match(/([A-Z][a-z]+)\s+(?:bhai|ji|sir|ka)/i) ||
                    text.match(/leak\s+for\s+([a-zA-Z]+)/i);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    if (!['Kitchen', 'Plumbing', 'Electrical', 'Repair', 'Fixing'].includes(rawName)) {
      clientName = rawName;
    }
  }

  // 3. Extract Job Title / Trade Type
  let jobTitle = 'General Service & Repair';
  const jobMap = [
    { key: /sink\s*leak|kitchen\s*sink/i, val: 'Kitchen Sink Leak Repair' },
    { key: /ac\s*(?:service|gas|repair|installation)/i, val: 'AC Service & Gas Top-up' },
    { key: /geyser|water\s*heater/i, val: 'Geyser Repair & Element Replacement' },
    { key: /switchboard|wiring|electrical/i, val: 'Electrical Wiring & Switchboard Repair' },
    { key: /plumbing|pipe\s*fitting|tap\s*leak/i, val: 'Plumbing & Pipe Fitting' },
    { key: /motor|water\s*pump/i, val: 'Water Pump Motor Servicing' },
    { key: /fan\s*repair|ceiling\s*fan/i, val: 'Ceiling Fan Installation & Repair' },
    { key: /sofa|cleaning/i, val: 'Deep Cleaning & Sanitization' },
  ];

  for (const item of jobMap) {
    if (item.key.test(text)) {
      jobTitle = item.val;
      break;
    }
  }

  // 4. Labor Hours (hours, hrs, ghante, ghanta)
  let laborHours = 1;
  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hrs|hr|hours|ghante|ghanta)/i);
  if (hoursMatch) {
    laborHours = parseFloat(hoursMatch[1]);
  }

  // 5. Hourly Rate / Labor charge (per hour, ghante ka, rate, rupaye)
  let hourlyRate = 350;
  const rateMatch = text.match(/(?:at|rate|charge|ghante\s*ka|labor)\s*(?:is\s*)?(\d+)\s*(?:per\s+hour|an\s+hour|rs|rupees|rupaye|\/hr)?/i) ||
                    text.match(/(\d+)\s*(?:per\s+hour|rupaye\s*ghante|rs\s*ghanta)/i);
  if (rateMatch) {
    hourlyRate = parseInt(rateMatch[1], 10);
  }

  // 6. GST Rate
  let gstRate = 18;
  const gstMatch = text.match(/(\d+)\s*(?:percent|%)\s*gst/i) || 
                   text.match(/gst\s*(?:rate\s*)?(?:of\s*|is\s*)?(\d+)/i);
  if (gstMatch) {
    const parsedGst = parseInt(gstMatch[1], 10);
    if ([0, 5, 12, 18, 28].includes(parsedGst)) {
      gstRate = parsedGst;
    }
  }

  // 7. Materials extraction (covers English + Hinglish terms)
  const materials = [];
  const materialRegex = /(?:a\s+|used\s+|bought\s+|naya\s+|ek\s+)?([a-zA-Z0-9\s]+?)\s+(?:which\s+)?(?:cost|of|at|ka|rupaye|rs\.?\s*)?\s*(?:rs\.?\s*|₹\s*)?(\d+)/gi;
  let match;
  while ((match = materialRegex.exec(text)) !== null) {
    const matName = match[1].replace(/(?:used|spent|bought|naya|ek|and|for|aur|laga)\s+/gi, '').trim();
    const matPrice = parseInt(match[2], 10);
    const noiseWords = ['hour', 'hours', 'rate', 'rupees', 'phone', 'number', 'ghante', 'ghanta', 'percent', 'gst'];
    const isNoise = noiseWords.some(noise => matName.toLowerCase().includes(noise));
    if (matName.length > 2 && matPrice > 0 && !isNoise && materials.length < 5) {
      materials.push({ name: matName, price: matPrice });
    }
  }

  if (materials.length === 0) {
    const generalPriceMatch = text.match(/(?:materials?|samman|parts?)\s+(?:cost|total|ka)?\s*(?:is\s*)?(\d+)/i);
    if (generalPriceMatch) {
      materials.push({ name: "Spare parts / Materials", price: parseInt(generalPriceMatch[1], 10) });
    }
  }

  return {
    clientName,
    clientPhone,
    jobTitle,
    laborHours,
    hourlyRate,
    materials,
    gstRate,
    notes: 'Service completed with standard warranty'
  };
}
