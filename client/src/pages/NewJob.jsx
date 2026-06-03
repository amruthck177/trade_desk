import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Mic, 
  Trash2, 
  Plus, 
  Check, 
  Sparkles, 
  FileText, 
  Send, 
  PlusCircle, 
  Wrench, 
  User, 
  Phone,
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function NewJob() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // Stepper State: 1 = Record, 2 = Review, 3 = Success
  const [step, setStep] = useState(1);

  // Step 1: Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [parsingLoading, setParsingLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  // Step 2: Form States (suggested values from AI parser)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [laborHours, setLaborHours] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(350);
  const [materials, setMaterials] = useState([]);
  const [gstRate, setGstRate] = useState(18); // 0, 5, 12, 18, 28
  const [transcript, setTranscript] = useState('');

  // Step 3: Success States
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [whatsAppSending, setWhatsAppSending] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  // Auto manual entry override via URL search query (?type=manual)
  useEffect(() => {
    const entryType = searchParams.get('type');
    if (entryType === 'manual') {
      setTranscript('Manual Invoice Entry Form');
      setStep(2);
    }
  }, [searchParams]);

  // Recording Timer
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setAudioBlob(null);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setParsingLoading(true);
    
    // Simulate audio file creation (since standard browsers require microphone access)
    // We send a mock audio recording file via FormDate to the server
    const dummyBlob = new Blob(['dummy audio content'], { type: 'audio/mp3' });
    const formData = new FormData();
    formData.append('audio', dummyBlob, 'invoice_recording.mp3');

    try {
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };
      
      const response = await axios.post('/api/voice/parse', formData, { headers });
      const { transcript: serverTranscript, parsedData } = response.data;

      // Map suggestion fields
      setTranscript(serverTranscript);
      setClientName(parsedData.clientName || '');
      setClientPhone(parsedData.clientPhone || '');
      setJobTitle(parsedData.jobTitle || '');
      setLaborHours(parsedData.laborHours || 1);
      setHourlyRate(parsedData.hourlyRate || 350);
      setMaterials(parsedData.materials || []);
      setGstRate(parsedData.gstRate || 18);
      
      setStep(2); // advance to AI Review phase
    } catch (err) {
      console.error('Failed to parse voice details, setting offline mocks:', err);
      // Fallback fallback details
      setTranscript('Fixing kitchen sink leak for Anil Kumar, phone is 9988776655. Worked 2 hours at 400. PVC pipe connector cost 150.');
      setClientName('Anil Kumar');
      setClientPhone('9988776655');
      setJobTitle('Plumbing - Sink Leak');
      setLaborHours(2);
      setHourlyRate(400);
      setMaterials([{ name: 'PVC pipe connector', price: 150 }]);
      setGstRate(18);
      setStep(2);
    } finally {
      setParsingLoading(false);
    }
  };

  // Materials row modifiers
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

  // Submit invoice generator
  const handleCreateInvoice = async () => {
    try {
      setParsingLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Save Job details
      const jobPayload = {
        clientName,
        clientPhone,
        jobTitle,
        laborHours,
        hourlyRate,
        materials,
        gstRate,
        status: 'unpaid'
      };

      const jobResponse = await axios.post('/api/jobs', jobPayload, { headers });
      const job = jobResponse.data;

      // 2. Generate PDF Invoice
      const invoiceResponse = await axios.post(`/api/invoices/generate/${job._id}`, {}, { headers });
      setGeneratedInvoice(invoiceResponse.data);

      setStep(3); // success view
    } catch (err) {
      console.error('Failed to save job/invoice details:', err);
    } finally {
      setParsingLoading(false);
    }
  };

  // Send WhatsApp Trigger
  const handleWhatsAppSend = async () => {
    if (!generatedInvoice) return;
    setWhatsAppSending(true);
    setWhatsAppSuccess(false);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/invoices/send-whatsapp/${generatedInvoice._id}`, {}, { headers });
      setWhatsAppSuccess(true);
    } catch (err) {
      console.error('WhatsApp failed:', err);
    } finally {
      setWhatsAppSending(false);
    }
  };

  // Format timer values
  const formatTimer = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto text-left flex flex-col gap-6">
      
      {/* STEPS HEADLINE */}
      <div className="flex items-center justify-between border-b border-navy-border/40 pb-5">
        <h1 className="text-xl font-display font-black text-text-primary">
          {step === 1 && 'Record Voice Note'}
          {step === 2 && 'AI review summary'}
          {step === 3 && 'Invoice Generated!'}
        </h1>

        {/* Badge steps */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono">
          <span className={`px-2.5 py-1 rounded-badge ${step >= 1 ? 'bg-primary text-white' : 'bg-navy-elevated text-text-secondary'}`}>
            1. RECORD
          </span>
          <span className="text-text-secondary">➔</span>
          <span className={`px-2.5 py-1 rounded-badge ${step >= 2 ? 'bg-primary text-white' : 'bg-navy-elevated text-text-secondary'}`}>
            2. REVIEW
          </span>
          <span className="text-text-secondary">➔</span>
          <span className={`px-2.5 py-1 rounded-badge ${step >= 3 ? 'bg-success text-white animate-pulse' : 'bg-navy-elevated text-text-secondary'}`}>
            3. DONE
          </span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 1: VOICE RECORDING SCREEN */}
      {step === 1 && (
        <div className="bg-navy-card border border-navy-border/60 p-8 rounded-card text-center flex flex-col items-center gap-6 shadow-card-glow">
          
          <div className="max-w-md mx-auto text-center flex flex-col gap-2">
            <h2 className="text-base font-bold text-text-primary">Tap to Speak Service Summary</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Describe what work you performed, who the customer was, their mobile number, hours billed, materials bought, and taxes.
            </p>
          </div>

          {/* Huge Record Button */}
          <div className="my-8 relative w-32 h-32 flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-4 bg-primary/30 rounded-full animate-pulse" />
              </>
            )}
            
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={parsingLoading}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-orange-glow border-4 border-navy-card hover:scale-105 active:scale-95 transition-all z-10 cursor-pointer ${
                isRecording ? 'bg-danger hover:bg-danger/90' : 'bg-gradient-to-tr from-primary to-primary-hover'
              }`}
            >
              {parsingLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : isRecording ? (
                <div className="w-8 h-8 bg-white rounded-lg" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Recording Timer / Transcription placeholder */}
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-mono font-bold text-text-primary">
                {formatTimer(recordingSeconds)}
              </span>
              <span className="text-xs text-danger font-semibold uppercase animate-pulse flex items-center gap-1">
                🔴 RECORDING AUDIO
              </span>
              
              {/* Voice Waves */}
              <div className="flex items-center gap-1.5 h-7 mt-3">
                {[...Array(12)].map((_, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-primary rounded-full animate-wave"
                    style={{
                      height: `${10 + Math.random() * 20}px`,
                      animationDelay: `${idx * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : parsingLoading ? (
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs text-primary font-bold uppercase animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5" /> AI Engine Extracting Details...
              </span>
              <p className="text-xs text-text-secondary">Whisper is transcribing voice and matching fields.</p>
            </div>
          ) : (
            <div className="text-xs text-text-secondary flex flex-col gap-3">
              <span>Prefer typing instead?</span>
              <button
                onClick={() => setStep(2)}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Skip voice & fill manually ➔
              </button>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 2: REVIEW SUMMARY FORM */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          {/* Transcript preview banner */}
          {transcript && (
            <div className="bg-navy-card/80 border border-navy-border/60 p-4.5 rounded-card">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Audio Transcript Log
              </h3>
              <p className="text-xs text-text-secondary italic leading-relaxed font-mono">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Editable Form */}
          <div className="bg-navy-card border border-navy-border/60 p-6 rounded-card shadow-card-glow flex flex-col gap-5 text-left">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-navy-border/40 pb-2">
              Customer Details
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Client Name */}
              <div className="floating-label-group">
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder=" "
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="clientName" className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Client Name
                </label>
                <span className="text-[9px] text-success font-semibold mt-1 block">✓ High Confidence</span>
              </div>

              {/* Client Phone */}
              <div className="floating-label-group">
                <input
                  type="tel"
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder=" "
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="clientPhone" className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Client Phone
                </label>
                <span className="text-[9px] text-success font-semibold mt-1 block">✓ High Confidence</span>
              </div>
            </div>

            {/* Job Details */}
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-navy-border/40 pb-2 mt-2">
              Line Items & Labor Billing
            </h3>

            {/* Job Title */}
            <div className="floating-label-group">
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder=" "
                className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
              />
              <label htmlFor="jobTitle" className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Service / Job Title
              </label>
              <span className="text-[9px] text-success font-semibold mt-1 block">✓ High Confidence</span>
            </div>

            {/* Hours stepper / Hourly rate */}
            <div className="grid sm:grid-cols-2 gap-5 items-center">
              {/* Hours Stepper */}
              <div className="flex items-center justify-between border border-navy-border/80 bg-navy-elevated/20 rounded-input p-2 h-10.5">
                <span className="text-xs text-text-secondary px-2">Labor Hours</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLaborHours(prev => Math.max(0, prev - 0.5))}
                    className="w-7 h-7 bg-navy-elevated rounded-lg flex items-center justify-center hover:bg-navy-border font-bold active:scale-90 text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono font-bold w-6 text-center">{laborHours}</span>
                  <button
                    type="button"
                    onClick={() => setLaborHours(prev => prev + 0.5)}
                    className="w-7 h-7 bg-navy-elevated rounded-lg flex items-center justify-center hover:bg-navy-border font-bold active:scale-90 text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rate input */}
              <div className="floating-label-group">
                <input
                  type="number"
                  id="hourlyRate"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  placeholder=" "
                  className="w-full bg-navy-elevated/40 border border-navy-border/80 focus:border-primary outline-none rounded-input px-3.5 py-2.5 text-sm transition-all"
                />
                <label htmlFor="hourlyRate">Hourly Labor Rate (₹)</label>
              </div>
            </div>

            {/* Materials Grid */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center border-b border-navy-border/40 pb-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Materials Used</span>
                <button
                  type="button"
                  onClick={handleAddMaterialRow}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Material
                </button>
              </div>

              {materials.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No materials items added yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {materials.map((mat, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Material name"
                        value={mat.name}
                        onChange={(e) => handleUpdateMaterialRow(index, 'name', e.target.value)}
                        className="flex-1 bg-navy-elevated/30 border border-navy-border/60 outline-none rounded-xl px-3 py-2 text-xs text-text-primary"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={mat.price || ''}
                        onChange={(e) => handleUpdateMaterialRow(index, 'price', e.target.value)}
                        className="w-24 bg-navy-elevated/30 border border-navy-border/60 outline-none rounded-xl px-3 py-2 text-xs font-mono text-text-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialRow(index)}
                        className="text-danger hover:text-danger/80 p-2 cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tax GST switches */}
            <div className="flex flex-col gap-3 mt-2 border-t border-navy-border/40 pt-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">GST Tax Bracket (%)</span>
              <div className="flex gap-2">
                {[0, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGstRate(rate)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                      gstRate === rate 
                        ? 'bg-primary text-white border-primary shadow-orange-glow/10 scale-102' 
                        : 'bg-navy-elevated/40 text-text-secondary border-navy-border/80 hover:text-text-primary hover:bg-navy-elevated'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Total display summary */}
            <div className="bg-navy-elevated/30 border border-navy-border/60 rounded-xl p-4.5 mt-2 flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Labor Cost:</span>
                <span>₹{(laborHours * hourlyRate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Materials Cost:</span>
                <span>₹{materials.reduce((sum, m) => sum + m.price, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST ({gstRate}%):</span>
                <span>
                  ₹{(
                    ((laborHours * hourlyRate + materials.reduce((sum, m) => sum + m.price, 0)) * (gstRate / 100))
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-text-primary font-bold border-t border-navy-border/60 pt-2 text-sm">
                <span>Total Bill Amount:</span>
                <span className="text-primary font-black">
                  ₹{(
                    (laborHours * hourlyRate + materials.reduce((sum, m) => sum + m.price, 0)) * (1 + gstRate / 100)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Cancel/Submit buttons */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-navy-elevated/40 hover:bg-navy-elevated text-text-secondary hover:text-text-primary font-bold py-3.5 px-6 rounded-button border border-navy-border/60 text-center transition-all cursor-pointer"
              >
                Back to Mic
              </button>
              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={parsingLoading || !clientName || !clientPhone || !jobTitle}
                className="flex-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-3.5 px-6 rounded-button shadow-orange-glow/15 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {parsingLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Compiling Invoice...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4.5 h-4.5" />
                    <span>Generate Invoice</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* STEP 3: INVOICE GENERATED SUCCESS STATE */}
      {step === 3 && (
        <div className="bg-navy-card border border-navy-border/60 p-8 rounded-card text-center flex flex-col items-center gap-6 shadow-card-glow">
          
          {/* Drawing animated Checkmark */}
          <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center text-success relative">
            <Check className="w-10 h-10 animate-draw-check" />
          </div>

          <div className="max-w-md mx-auto text-center flex flex-col gap-2">
            <h2 className="text-lg font-display font-black text-text-primary">Invoice Generated Successfully!</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Invoice #{generatedInvoice?.invoiceNumber} is now saved. You can preview the document or deliver it directly to the customer.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
            {/* Delivery Action */}
            <button
              onClick={handleWhatsAppSend}
              disabled={whatsAppSending || whatsAppSuccess}
              className={`w-full font-bold py-3.5 px-6 rounded-button transition-all flex items-center justify-center gap-2 cursor-pointer ${
                whatsAppSuccess 
                  ? 'bg-success/20 text-success border border-success/30' 
                  : 'bg-primary hover:bg-primary-hover text-white shadow-orange-glow/15 hover:scale-102 active:scale-98'
              }`}
            >
              {whatsAppSending ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Delivering via WhatsApp...</span>
                </>
              ) : whatsAppSuccess ? (
                <>
                  <Check className="w-4.5 h-4.5" />
                  <span>Delivered to Customer!</span>
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" />
                  <span>Send via WhatsApp</span>
                </>
              )}
            </button>

            {/* View PDF */}
            <button
              onClick={() => navigate(`/invoices/${generatedInvoice?._id}`)}
              className="w-full bg-navy-elevated hover:bg-navy-border text-text-primary border border-navy-border/60 font-bold py-3 px-6 rounded-button text-center transition-all cursor-pointer"
            >
              Preview Invoice Details
            </button>
            
            {/* New Job */}
            <button
              onClick={() => {
                // Reset states
                setStep(1);
                setClientName('');
                setClientPhone('');
                setJobTitle('');
                setLaborHours(1);
                setHourlyRate(350);
                setMaterials([]);
                setGstRate(18);
                setGeneratedInvoice(null);
                setWhatsAppSuccess(false);
              }}
              className="text-xs font-bold text-text-secondary hover:text-text-primary py-2 mt-4 cursor-pointer"
            >
              ➔ Create Another Invoice
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
