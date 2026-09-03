import React from 'react';

/**
 * Native Browser Web Speech Synthesis Soundbox Engine
 * Speaks: "TradeDesk par [amount] rupaye prapt hue" / "Payment of Rs [amount] received on TradeDesk"
 */
export const playSoundboxChime = (amount) => {
  try {
    const formattedAmount = Math.round(Number(amount) || 0);
    
    // Play dual harmonic audio chime using Web Audio API
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Chime note frequencies (C5 -> G5)
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);

      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    }

    // Speech synthesis announcement
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any active speech

      const textToSpeak = `TradeDesk par ${formattedAmount} rupaye prapt hue`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.1;

      // Select Hindi or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 400);
    }
  } catch (err) {
    console.warn('Soundbox synthesis note:', err.message);
  }
};

export default function SoundboxWidget({ amount, clientName, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-3.5 animate-bounce-short">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
        🔊
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-black/20 px-1.5 py-0.5 rounded">
            TRADEDESK SOUNDBOX
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </div>
        <p className="text-sm font-black font-mono mt-0.5">₹{amount} Received</p>
        <p className="text-[11px] text-emerald-100">{clientName || 'Customer'} settled via UPI</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 p-1 text-emerald-200 hover:text-white text-xs font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
}
