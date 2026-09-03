import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Mic, 
  Square,
  Trash2, 
  Plus, 
  Check, 
  Sparkles, 
  FileText, 
  Send, 
  Wrench, 
  User, 
  Phone,
  ArrowRight,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Package,
  PenTool,
  Camera,
  Calendar,
  MapPin,
  IndianRupee,
  Share2,
  Download,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Percent,
  Tag,
  Image as ImageIcon,
  WifiOff,
  Cloud
} from 'lucide-react';

export default function NewJob() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // Stepper State: 1 = Record, 2 = Review, 3 = Success
  const [step, setStep] = useState(1);

  // Document Type: 'invoice' | 'estimate'
  const [documentType, setDocumentType] = useState('invoice');

  // Language Mode: 'Hinglish' | 'Hindi' | 'English'
  const [languageMode, setLanguageMode] = useState('Hinglish');

  // Step 1: Live Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [parsingLoading, setParsingLoading] = useState(false);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState('');
  const [micPermissionError, setMicPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioElementRef = useRef(null);

  // Step 2: Form States
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [stateOfSupply, setStateOfSupply] = useState('Delhi');
  const [jobTitle, setJobTitle] = useState('');
  const [laborHours, setLaborHours] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(400);
  const [materials, setMaterials] = useState([]);
  const [taxType, setTaxType] = useState('intra_state'); // 'intra_state' | 'inter_state'
  const [gstRate, setGstRate] = useState(18); // 0, 5, 12, 18, 28
  const [discountType, setDiscountType] = useState('none'); // 'none' | 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState('');
  const [pdfTheme, setPdfTheme] = useState('modern');
  const [paymentDueDate, setPaymentDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Digital Signature Canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');

  // Proof Photos
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  // Saved Catalog Items for Quick Add
  const [rateCards, setRateCards] = useState([]);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // Step 3: Success States
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [whatsAppSending, setWhatsAppSending] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  // 4 Trade Voice Simulators
  const tradePresets = [
    {
      trade: 'AC Service & Gas',
      icon: '❄️',
      transcript: "AC servicing and gas refill done for Sharmaji, phone 9876543210. 2 hours at 450 per hour. Added 4.0 MFD capacitor for 350 and R410A gas for 1200. GST 18 percent.",
      data: {
        clientName: 'Sharmaji',
        clientPhone: '9876543210',
        jobTitle: 'AC Deep Servicing & Gas Charging',
        laborHours: 2,
        hourlyRate: 450,
        materials: [
          { name: '4.0 MFD Motor Capacitor', price: 350 },
          { name: 'R410A Refrigerant Gas Top-up', price: 1200 }
        ],
        gstRate: 18
      }
    },
    {
      trade: 'Electrician & MCB',
      icon: '⚡',
      transcript: "Short circuit repair in kitchen for Rajesh Kumar, phone 9988776655. Spent 3 hours fixing wiring at 350 per hr. Replaced 32A MCB switch 450 and 2.5mm copper wire 600.",
      data: {
        clientName: 'Rajesh Kumar',
        clientPhone: '9988776655',
        jobTitle: 'Kitchen Short Circuit & MCB Replacement',
        laborHours: 3,
        hourlyRate: 350,
        materials: [
          { name: '32A Double Pole MCB Switch', price: 450 },
          { name: '2.5 sq mm Copper Wire Coil', price: 600 }
        ],
        gstRate: 18
      }
    },
    {
      trade: 'Plumber Pipe Leak',
      icon: '🔧',
      transcript: "Fixed bathroom main line pipe leakage for Anjali Mehta, phone 9123456789. 1.5 hours at 400. Replaced CPVC brass elbow 220, teflon tape 50, and PVC drain pipe 280.",
      data: {
        clientName: 'Anjali Mehta',
        clientPhone: '9123456789',
        jobTitle: 'Bathroom Main Line Leakage Repair',
        laborHours: 1.5,
        hourlyRate: 400,
        materials: [
          { name: 'CPVC Brass Elbow Fitting 1"', price: 220 },
          { name: 'Heavy PVC Waste Drain Pipe', price: 280 },
          { name: 'Teflon Seal Tape & Solvent', price: 50 }
        ],
        gstRate: 18
      }
    },
    {
      trade: 'Washing Machine',
      icon: '🧺',
      transcript: "Front load washing machine drum repair for Vikas Gupta, phone 9812345678. 2 hours labor at 500. Fitted new drain pump 850 and drum belt 350.",
      data: {
        clientName: 'Vikas Gupta',
        clientPhone: '9812345678',
        jobTitle: 'Washing Machine Drum & Motor Repair',
        laborHours: 2,
        hourlyRate: 500,
        materials: [
          { name: 'Automatic Drain Pump Assembly', price: 850 },
          { name: 'Motor Drive Belt', price: 350 }
        ],
        gstRate: 18
      }
    }
  ];

  // Load URL parameters & Rate Cards catalog
  useEffect(() => {
    const entryType = searchParams.get('type');
    const paramName = searchParams.get('clientName');
    const paramPhone = searchParams.get('clientPhone');

    if (paramName) setClientName(paramName);
    if (paramPhone) setClientPhone(paramPhone);

    if (entryType === 'estimate') setDocumentType('estimate');
    if (entryType === 'manual' || paramName) {
      setTranscript('Manual Invoice Entry Form');
      setStep(2);
    }

    const fetchCatalog = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get('/api/rate-cards', { headers });
        setRateCards(res.data);
      } catch (err) {
        console.error('Failed to load rate cards in NewJob:', err);
      }
    };
    fetchCatalog();
  }, [searchParams, token]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  // Start Live Speech Recognition & MediaRecorder
  const handleStartRecording = async () => {
    setMicPermissionError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setLiveSpeechTranscript('');
    audioChunksRef.current = [];

    // 1. Live Web Speech API if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageMode === 'Hindi' ? 'hi-IN' : 'en-IN';
        
        recognition.onresult = (event) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + ' ';
          }
          setLiveSpeechTranscript(currentText.trim());
        };

        recognition.onerror = (e) => {
          console.warn('Live speech recognition warning:', e.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (speechErr) {
        console.warn('Speech recognition init error:', speechErr.message);
      }
    }

    // 2. MediaRecorder for Audio File
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording not supported.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.warn('Microphone fallback triggered:', err.message);
      setMicPermissionError('Microphone permission not active. Using simulated speech mode.');
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    setIsRecording(false);
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Process Recording & Send to AI Parser
  const handleProcessRecording = async () => {
    setParsingLoading(true);
    const formData = new FormData();

    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.webm');
    } else {
      const dummyBlob = new Blob(['sample audio content'], { type: 'audio/mp3' });
      formData.append('audio', dummyBlob, 'invoice_recording.mp3');
    }

    try {
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };
      
      const response = await axios.post('/api/voice/parse', formData, { headers });
      const { transcript: serverTranscript, parsedData } = response.data;

      setTranscript(liveSpeechTranscript || serverTranscript);
      setClientName(parsedData.clientName || 'Rahul Verma');
      setClientPhone(parsedData.clientPhone || '9876543210');
      setJobTitle(parsedData.jobTitle || 'AC Servicing & Gas Top-up');
      setLaborHours(parsedData.laborHours || 2);
      setHourlyRate(parsedData.hourlyRate || 400);
      setMaterials(parsedData.materials?.length ? parsedData.materials : [
        { name: 'Copper Pipe (1/4 inch)', price: 1200 },
        { name: 'Gas Refill (R410A)', price: 1000 }
      ]);
      setGstRate(parsedData.gstRate || 18);
      if (parsedData.notes) setNotes(parsedData.notes);
      
      setStep(2);
    } catch (err) {
      console.error('Failed to parse voice details, setting fallback:', err);
      const fallbackPreset = tradePresets[0];
      setTranscript(liveSpeechTranscript || fallbackPreset.transcript);
      setClientName(fallbackPreset.data.clientName);
      setClientPhone(fallbackPreset.data.clientPhone);
      setJobTitle(fallbackPreset.data.jobTitle);
      setLaborHours(fallbackPreset.data.laborHours);
      setHourlyRate(fallbackPreset.data.hourlyRate);
      setMaterials(fallbackPreset.data.materials);
      setGstRate(fallbackPreset.data.gstRate);
      setStep(2);
    } finally {
      setParsingLoading(false);
    }
  };

  // One-click trade simulator trigger
  const handleApplyTradePreset = (preset) => {
    setTranscript(preset.transcript);
    setClientName(preset.data.clientName);
    setClientPhone(preset.data.clientPhone);
    setJobTitle(preset.data.jobTitle);
    setLaborHours(preset.data.laborHours);
    setHourlyRate(preset.data.hourlyRate);
    setMaterials(preset.data.materials);
    setGstRate(preset.data.gstRate);
    setStep(2);
  };

  // Audio Player Toggle
  const togglePlayAudio = () => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Materials modifier
  const handleAddMaterialRow = () => {
    setMaterials([...materials, { name: '', price: 0 }]);
  };

  const handleUpdateMaterialRow = (index, field, val) => {
    const updated = [...materials];
    if (field === 'price') {
      updated[index][field] = Number(val) || 0;
    } else {
      updated[index][field] = val;
    }
    setMaterials(updated);
  };

  const handleRemoveMaterialRow = (index) => {
    setMaterials(materials.filter((_, idx) => idx !== index));
  };

  // Photo uploads
  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') setBeforePhoto(reader.result);
      if (type === 'after') setAfterPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Inject Item from Catalog
  const handleAddFromCatalog = (item) => {
    if (item.category === 'labor') {
      setHourlyRate(item.defaultRate);
      setJobTitle(prev => prev ? `${prev} & ${item.title}` : item.title);
    } else if (item.category === 'service') {
      setJobTitle(item.title);
      setHourlyRate(item.defaultRate);
      setGstRate(item.gstRate);
    } else {
      setMaterials([...materials, { name: item.title, price: item.defaultRate }]);
    }
    setShowCatalogDropdown(false);
  };

  // --- Signature Canvas Handling ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl('');
  };

  // --- Submit Invoice Creation ---
  const handleCreateInvoice = async () => {
    try {
      setParsingLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const jobPayload = {
        documentType,
        clientName,
        clientPhone,
        clientAddress,
        clientGstin,
        stateOfSupply,
        jobTitle,
        laborHours,
        hourlyRate,
        materials,
        taxType,
        gstRate,
        discountType,
        discountValue,
        pdfTheme,
        notes,
        paymentDueDate,
        customerSignature: signatureDataUrl,
        beforePhotoUrl: beforePhoto,
        afterPhotoUrl: afterPhoto,
        status: documentType === 'estimate' ? 'draft' : 'unpaid'
      };

      const jobResponse = await axios.post('/api/jobs', jobPayload, { headers });
      const job = jobResponse.data;

      const invoiceResponse = await axios.post(`/api/invoices/generate/${job._id}`, {}, { headers });
      setGeneratedInvoice(invoiceResponse.data);

      setStep(3); // Success Screen
    } catch (err) {
      console.error('Failed to create invoice:', err);
      alert(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setParsingLoading(false);
    }
  };

  // --- WhatsApp Trigger ---
  const handleWhatsAppSend = async () => {
    if (!generatedInvoice) return;
    setWhatsAppSending(true);
    setWhatsAppSuccess(false);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/invoices/send-whatsapp/${generatedInvoice._id}`, {}, { headers });
      setWhatsAppSuccess(true);
    } catch (err) {
      console.error('WhatsApp dispatch failed:', err);
    } finally {
      setWhatsAppSending(false);
    }
  };

  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculations with Discount Engine
  const laborSubtotal = (Number(laborHours) || 0) * (Number(hourlyRate) || 0);
  const materialsSubtotal = materials.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const grossSubtotal = laborSubtotal + materialsSubtotal;

  let calculatedDiscount = 0;
  if (discountType === 'percentage') {
    calculatedDiscount = (grossSubtotal * (Number(discountValue) || 0)) / 100;
  } else if (discountType === 'fixed') {
    calculatedDiscount = Number(discountValue) || 0;
  }
  calculatedDiscount = Math.min(grossSubtotal, Math.round(calculatedDiscount * 100) / 100);

  const taxableSubtotal = Math.max(0, grossSubtotal - calculatedDiscount);
  const calculatedGst = Math.round((taxableSubtotal * (gstRate / 100)) * 100) / 100;
  const calculatedTotal = taxableSubtotal + calculatedGst;

  return (
    <div className="max-w-3xl mx-auto text-left flex flex-col gap-6">
      
      {/* 1. Stepper Header & Document Type Switcher */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-display font-black text-white">
              {step === 1 && (documentType === 'estimate' ? '📝 Create Quotation / Estimate' : '🎙️ Voice to Tax Invoice')}
              {step === 2 && '⚡ Review & Customize'}
              {step === 3 && '🎉 Document Generated!'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-primary/20 text-primary border border-primary/30">
              {documentType}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {step === 1 && 'Speak or tap a fast trade preset below.'}
            {step === 2 && 'Inspect extracted items, discount, GST, and customer signature.'}
            {step === 3 && 'Scannable UPI QR code & WhatsApp ready.'}
          </p>
        </div>

        {/* Document Type Toggle Pills */}
        <div className="flex items-center gap-1.5 bg-navy-surface p-1 rounded-xl border border-navy-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDocumentType('invoice')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              documentType === 'invoice' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'
            }`}
          >
            Tax Invoice (पक्का बिल)
          </button>
          <button
            type="button"
            onClick={() => setDocumentType('estimate')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              documentType === 'estimate' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-muted hover:text-white'
            }`}
          >
            Estimate (कच्चा बिल)
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 1: VOICE RECORDING SCREEN */}
      {step === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-card text-center flex flex-col items-center gap-6 shadow-card-glow">
          
          {/* Language Selector */}
          <div className="flex items-center justify-between w-full max-w-sm border-b border-navy-border/80 pb-3">
            <span className="text-xs font-bold text-text-secondary">Language Recognition:</span>
            <div className="flex gap-1 bg-navy-surface p-1 rounded-xl border border-navy-border">
              {['Hinglish', 'Hindi', 'English'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguageMode(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    languageMode === lang ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Fast Trade Presets */}
          <div className="w-full text-left">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">
              ⚡ 1-Click Fast Trade Simulators:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tradePresets.map((tp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTradePreset(tp)}
                  className="p-2.5 rounded-xl bg-navy-surface hover:bg-navy-border border border-navy-border text-left transition-all hover:border-primary/50 group cursor-pointer"
                >
                  <span className="text-lg block mb-1">{tp.icon}</span>
                  <span className="text-xs font-bold text-white block group-hover:text-primary transition-colors">{tp.trade}</span>
                  <span className="text-[10px] text-text-muted">Auto-fill ➔</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Transcript Display Box */}
          {liveSpeechTranscript && (
            <div className="w-full max-w-md bg-navy-surface border border-primary/40 rounded-xl p-3 text-xs text-left animate-fade-in">
              <span className="text-[10px] text-primary uppercase font-bold flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" /> Live Transcribing:
              </span>
              <p className="text-white italic">"{liveSpeechTranscript}"</p>
            </div>
          )}

          {micPermissionError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 flex items-center gap-2 max-w-md text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{micPermissionError}</span>
            </div>
          )}

          {/* Record Button with Gradient Equalizer Waveform */}
          <div className="my-2 relative w-36 h-36 flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-3 bg-primary/30 rounded-full animate-pulse" />
              </>
            )}
            
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer ${
                isRecording 
                  ? 'bg-danger text-white shadow-lg shadow-danger/50 animate-pulse' 
                  : 'bg-gradient-to-tr from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white shadow-orange-glow hover:scale-105'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-9 h-9 fill-current mb-1" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">STOP</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 mb-1" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">SPEAK</span>
                </>
              )}
            </button>
          </div>

          {/* Timer or Audio Processing Actions */}
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping" />
                <span className="font-mono text-xl font-bold text-danger">
                  {formatTimer(recordingSeconds)}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">• AI Listening...</span>
              </div>
              <div className="flex items-center gap-1 h-6">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 rounded-full waveform-gradient animate-pulse" 
                    style={{ 
                      height: `${Math.max(8, Math.sin(i + recordingSeconds) * 24)}px`,
                      animationDelay: `${i * 80}ms` 
                    }} 
                  />
                ))}
              </div>
            </div>
          ) : audioUrl ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <audio 
                ref={audioElementRef} 
                src={audioUrl} 
                onEnded={() => setIsPlayingAudio(false)} 
                className="hidden" 
              />

              <div className="w-full bg-navy-surface border border-navy-border rounded-xl p-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="p-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <div className="text-left flex-1">
                  <p className="text-xs font-bold text-white">Voice Note Captured</p>
                  <p className="text-[10px] text-text-muted font-mono">{formatTimer(recordingSeconds)} duration</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="p-2 text-text-muted hover:text-white transition-colors text-xs flex items-center gap-1"
                  title="Re-record"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-record
                </button>
              </div>

              <button
                type="button"
                onClick={handleProcessRecording}
                disabled={parsingLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-orange-glow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {parsingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Analyzing Speech & Pricing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {documentType === 'estimate' ? 'Estimate' : 'Invoice'} with AI ➔
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTranscript('Manual Entry Form');
                setStep(2);
              }}
              className="text-xs text-text-muted hover:text-primary transition-colors font-medium"
            >
              Skip Voice and Enter Details Manually ➔
            </button>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 2: REVIEW & CUSTOMIZE INVOICE FORM */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          
          {/* Transcript Banner */}
          {transcript && transcript !== 'Manual Entry Form' && (
            <div className="glass-panel-active rounded-xl p-3.5 flex items-start gap-3 text-xs">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-primary block mb-0.5">Voice Transcript Summary</span>
                <p className="text-text-secondary italic">"{transcript}"</p>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="glass-panel p-6 rounded-card flex flex-col gap-5 shadow-card">
            
            {/* 1. Client Details Section */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> 1. Client & Billing Contact
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">WhatsApp Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Service Address / Location</label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="e.g. 23, Green Park, New Delhi"
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Client GSTIN (Optional B2B)</label>
                  <input
                    type="text"
                    value={clientGstin}
                    onChange={(e) => setClientGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 07ABCDE1234F1Z5"
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 2. Job Title & Labor Section */}
            <div className="border-t border-navy-border/60 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-primary" /> 2. Scope of Work & Labor
                </h3>

                {rateCards.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCatalogDropdown(!showCatalogDropdown)}
                      className="text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Package className="w-3 h-3" /> Quick Add from Catalog ▾
                    </button>

                    {showCatalogDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-64 bg-navy-card border border-navy-border rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto p-1.5 flex flex-col gap-1">
                        {rateCards.map(rc => (
                          <button
                            key={rc._id}
                            type="button"
                            onClick={() => handleAddFromCatalog(rc)}
                            className="text-left px-2.5 py-1.5 rounded-lg hover:bg-navy-surface text-xs text-white flex items-center justify-between"
                          >
                            <span className="truncate pr-2 font-medium">{rc.title}</span>
                            <span className="font-mono text-primary font-bold">₹{rc.defaultRate}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Work Description *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. AC Servicing & Gas Top-up"
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Labor Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Hourly Labor Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Materials & Spare Parts */}
            <div className="border-t border-navy-border/60 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" /> 3. Materials & Spare Parts
                </h3>
                <button
                  type="button"
                  onClick={handleAddMaterialRow}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Part
                </button>
              </div>

              {materials.length === 0 ? (
                <div className="text-xs text-text-muted py-2 bg-navy-surface/50 rounded-xl px-3 border border-dashed border-navy-border">
                  No spare parts added. Tap "+ Add Part" to add parts.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {materials.map((mat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mat.name}
                        onChange={(e) => handleUpdateMaterialRow(idx, 'name', e.target.value)}
                        placeholder="e.g. Copper Pipe (1/4 inch)"
                        className="flex-1 px-3 py-1.5 bg-navy-surface border border-navy-border rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                      />
                      <div className="w-28 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono">₹</span>
                        <input
                          type="number"
                          value={mat.price}
                          onChange={(e) => handleUpdateMaterialRow(idx, 'price', e.target.value)}
                          placeholder="Price"
                          className="w-full pl-6 pr-2 py-1.5 bg-navy-surface border border-navy-border rounded-lg text-xs text-white focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialRow(idx)}
                        className="p-1.5 text-text-muted hover:text-danger rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Tax Engine, Discount & Supply State */}
            <div className="border-t border-navy-border/60 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Tax Jurisdiction</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="intra_state">Intra-State (CGST + SGST)</option>
                  <option value="inter_state">Inter-State (IGST)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">GST Tax Rate</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value={0}>0% (Nil / Exempt)</option>
                  <option value={5}>5% (Basic Goods)</option>
                  <option value={12}>12% (Concessional)</option>
                  <option value={18}>18% (Standard Rate)</option>
                  <option value={28}>28% (Luxury / Heavy)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Discount Mode</label>
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-28 px-2 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="none">None</option>
                    <option value="percentage">% Percent</option>
                    <option value="fixed">₹ Flat</option>
                  </select>
                  {discountType !== 'none' && (
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                      placeholder="Disc"
                      className="flex-1 px-2 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 5. Before & After Photos Gallery */}
            <div className="border-t border-navy-border/60 pt-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-primary" /> 5. Job Proof Photos (Before & After)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Before Photo */}
                <div className="border border-dashed border-navy-border rounded-xl p-3 bg-navy-surface/40 flex flex-col items-center justify-center text-center">
                  {beforePhoto ? (
                    <div className="relative w-full">
                      <img src={beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setBeforePhoto(null)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full text-[10px]"
                      >
                        ✕
                      </button>
                      <span className="text-[10px] font-bold text-text-secondary mt-1 block">Before Work Photo</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-3">
                      <ImageIcon className="w-6 h-6 text-text-muted mb-1" />
                      <span className="text-xs font-semibold text-text-secondary">Upload "Before" Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} className="hidden" />
                    </label>
                  )}
                </div>

                {/* After Photo */}
                <div className="border border-dashed border-navy-border rounded-xl p-3 bg-navy-surface/40 flex flex-col items-center justify-center text-center">
                  {afterPhoto ? (
                    <div className="relative w-full">
                      <img src={afterPhoto} alt="After" className="h-24 w-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setAfterPhoto(null)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full text-[10px]"
                      >
                        ✕
                      </button>
                      <span className="text-[10px] font-bold text-emerald-400 mt-1 block">After Work (Finished) Photo</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-3">
                      <ImageIcon className="w-6 h-6 text-text-muted mb-1" />
                      <span className="text-xs font-semibold text-text-secondary">Upload "After" Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Customer Digital Signature Canvas */}
            <div className="border-t border-navy-border/60 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-primary" /> 6. Customer Work Acceptance Signature
                </h3>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-danger hover:underline font-semibold"
                  >
                    Clear Signature
                  </button>
                )}
              </div>

              <div className="border border-navy-border rounded-xl p-2 bg-white relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[90px] cursor-crosshair touch-none"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                    Customer signs here with finger or stylus ✍️
                  </div>
                )}
              </div>
            </div>

            {/* Live Calculation Summary Banner */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Labor Cost ({laborHours} hrs @ ₹{hourlyRate}):</span>
                <span className="font-mono text-white">₹{laborSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Materials Total:</span>
                <span className="font-mono text-white">₹{materialsSubtotal.toFixed(2)}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                  <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Special'}):</span>
                  <span className="font-mono">- ₹{calculatedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Taxable Subtotal:</span>
                <span className="font-mono text-white font-semibold">₹{taxableSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>
                  {taxType === 'inter_state' ? `IGST (${gstRate}%):` : `CGST (${(gstRate/2).toFixed(1)}%) + SGST (${(gstRate/2).toFixed(1)}%):`}
                </span>
                <span className="font-mono text-white">₹{calculatedGst.toFixed(2)}</span>
              </div>
              <div className="border-t border-navy-border pt-2 flex justify-between text-sm font-bold text-white">
                <span className="text-primary">{documentType === 'estimate' ? 'Estimated Total:' : 'Total Amount Due:'}</span>
                <span className="font-mono text-base text-primary">₹{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-navy-surface transition-colors"
              >
                ← Back to Recording
              </button>

              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={parsingLoading || !clientName || !clientPhone || !jobTitle}
                className="px-6 py-3 bg-gradient-to-r from-primary to-amber-500 hover:from-primary-hover hover:to-amber-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-orange-glow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {parsingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Document...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> Generate {documentType === 'estimate' ? 'Estimate' : 'Invoice'} ➔
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 3: SUCCESS SCREEN */}
      {step === 3 && generatedInvoice && (
        <div className="glass-panel p-8 rounded-card text-center flex flex-col items-center gap-6 shadow-card animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 text-success flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {documentType === 'estimate' ? 'Estimate Created Successfully!' : 'Tax Invoice Successfully Generated!'}
            </h2>
            <p className="text-xs text-text-secondary font-mono mt-1">Document ID: {generatedInvoice.invoiceNumber}</p>
          </div>

          <div className="w-full max-w-sm bg-navy-surface border border-navy-border rounded-xl p-4 text-xs text-left flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Customer:</span>
              <span className="font-bold text-white">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">WhatsApp Mobile:</span>
              <span className="font-mono text-white">+91 {clientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Bill:</span>
              <span className="font-mono font-bold text-success text-sm">₹{calculatedTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={handleWhatsAppSend}
              disabled={whatsAppSending || whatsAppSuccess}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                whatsAppSuccess
                  ? 'bg-success text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
              }`}
            >
              {whatsAppSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching WhatsApp...
                </>
              ) : whatsAppSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Sent on WhatsApp!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send on WhatsApp
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/invoices/download/${generatedInvoice._id}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-navy-surface hover:bg-navy-border border border-navy-border rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>

              <Link
                to={`/invoices/${generatedInvoice._id}`}
                className="py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                View Live Document ➔
              </Link>
            </div>
          </div>

          <Link
            to="/jobs"
            className="text-xs text-text-muted hover:text-white mt-2"
          >
            ← Return to Invoices & Jobs List
          </Link>

        </div>
      )}

    </div>
  );
}
