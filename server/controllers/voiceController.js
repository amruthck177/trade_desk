import { transcribeAudio, parseJobDetails } from '../services/openaiService.js';
import fs from 'fs';

export const parseVoiceNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio recording file provided' });
    }

    const filePath = req.file.path;

    // 1. Transcribe audio to text
    const transcript = await transcribeAudio(filePath);

    // 2. Parse text to structured invoice details
    const parsedData = await parseJobDetails(transcript);

    // Clean up local uploaded audio file to save disk space
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('Failed to delete temporary audio upload:', err.message);
    }

    res.json({
      transcript,
      parsedData,
    });
  } catch (error) {
    console.error('Voice Parsing Error:', error.message);
    res.status(500).json({ message: 'Server failed to transcribe or parse the voice note' });
  }
};
