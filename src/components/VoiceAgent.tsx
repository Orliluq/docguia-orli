import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Edit3, Check, X } from 'lucide-react';
import { parseVoiceToAppointment } from '../services/geminiService';
import { ParsedAppointmentData, VoiceStatus } from '../types';

interface DraftModalProps {
  transcript: string;
  onSave: (editedTranscript: string) => void;
  onCancel: () => void;
}

const DraftModal: React.FC<DraftModalProps> = ({ transcript, onSave, onCancel }) => {
  const [editedText, setEditedText] = useState(transcript);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit3 className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Editar transcripción</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Corrige tu transcripción antes de procesar:
          </label>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Crea una cita mañana a las 3pm con María Pérez por control"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(editedText)}
            disabled={!editedText.trim() || editedText === transcript}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Procesar texto
          </button>
        </div>
      </div>
    </div>
  );
};

interface VoiceAgentProps {
  onAppointmentParsed: (data: ParsedAppointmentData) => void;
}

export const VoiceAgent: React.FC<VoiceAgentProps> = ({ onAppointmentParsed }) => {
  const [status, setStatus] = useState<VoiceStatus>(VoiceStatus.IDLE);
  const [transcript, setTranscript] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false; // Stop automatically after silence
      recognition.lang = 'es-ES';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setStatus(VoiceStatus.LISTENING);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interimTranscript += event.results[i][0].transcript;
        }
        setTranscript(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setStatus(VoiceStatus.ERROR);
        setTimeout(() => setStatus(VoiceStatus.IDLE), 2000);
      };

      recognition.onend = async () => {
        if (status === VoiceStatus.LISTENING) {
          // If we have text, process it
          if (recognitionRef.current.finalTranscript) {
             handleProcessing(recognitionRef.current.finalTranscript);
          } else {
             // Sometimes onend fires before we grab the final text from state, 
             // relying on the state `transcript` is risky in closures. 
             // We trigger processing manually via button usually, but here auto-stop.
             // We'll let the user click stop or wait for silence.
             // For this demo, let's trigger if we have content.
             // (Logic moved to handleStop for better control)
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Web Speech API not supported");
    }
  }, []);

  const handleStart = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setStatus(VoiceStatus.LISTENING);
    } else {
        alert("Tu navegador no soporta reconocimiento de voz nativo.");
    }
  };

  const handleStop = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (transcript.length > 3) {
        setFinalTranscript(transcript);
        setShowDraftModal(true);
      } else {
        setStatus(VoiceStatus.IDLE);
      }
    }
  };

  const handleProcessing = async (text: string) => {
    setStatus(VoiceStatus.PROCESSING);
    try {
      const result = await parseVoiceToAppointment(text);
      onAppointmentParsed(result);
      setStatus(VoiceStatus.IDLE);
      setTranscript('');
      setFinalTranscript('');
      setShowDraftModal(false);
    } catch (e) {
      console.error(e);
      setStatus(VoiceStatus.ERROR);
      setTimeout(() => setStatus(VoiceStatus.IDLE), 3000);
    }
  };

  const handleDraftSave = (editedText: string) => {
    handleProcessing(editedText);
  };

  const handleDraftCancel = () => {
    setShowDraftModal(false);
    setFinalTranscript('');
    setStatus(VoiceStatus.IDLE);
  };

  // Dynamic Styles based on status
  const getButtonColor = () => {
    switch (status) {
      case VoiceStatus.LISTENING: return 'bg-red-500 animate-pulse';
      case VoiceStatus.PROCESSING: return 'bg-primary-400';
      case VoiceStatus.ERROR: return 'bg-red-800';
      default: return 'bg-primary-600 hover:bg-primary-700';
    }
  };

  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      
      {/* Transcript Bubble */}
      {(status === VoiceStatus.LISTENING || status === VoiceStatus.PROCESSING) && (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-primary-100 max-w-sm mb-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-2 mb-2 text-primary-600 text-xs font-bold uppercase tracking-wider">
             {status === VoiceStatus.PROCESSING ? (
                <>
                  <Sparkles size={14} className="animate-spin-slow" />
                  <span>Interpretando...</span>
                </>
             ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>Escuchando...</span>
                </>
             )}
          </div>
          <p className="text-gray-700 font-medium text-lg leading-relaxed">
            "{transcript || '...'}"
          </p>
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={status === VoiceStatus.LISTENING ? handleStop : handleStart}
        className={`${getButtonColor()} text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center`}
        style={{ width: '64px', height: '64px' }}
      >
        {status === VoiceStatus.PROCESSING ? (
          <Loader2 size={28} className="animate-spin" />
        ) : status === VoiceStatus.LISTENING ? (
          <MicOff size={28} />
        ) : (
          <Mic size={28} />
        )}
      </button>
      
      {/* Draft Mode Modal */}
      {showDraftModal && (
        <DraftModal
          transcript={finalTranscript}
          onSave={handleDraftSave}
          onCancel={handleDraftCancel}
        />
      )}

      {/* Tooltip hint if idle */}
      {status === VoiceStatus.IDLE && (
         <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity absolute right-20 top-4 whitespace-nowrap">
            Crear cita con voz
         </div>
      )}
    </div>
  );
};