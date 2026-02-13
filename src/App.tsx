import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { AppointmentModal } from './components/AppointmentModal';
import { VoiceAgent } from './components/VoiceAgent';
import { Appointment, ParsedAppointmentData } from './types';
import { INITIAL_APPOINTMENTS } from './constants';
import { Menu } from 'lucide-react';

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<ParsedAppointmentData> | null>(null);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // UX: Voice Trigger Logic
  // When the voice agent finishes parsing, it calls this to open the modal with pre-filled data.
  const handleVoiceParseResult = (data: ParsedAppointmentData) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const handleCreateManual = () => {
    setModalData(null); // Reset for clean entry
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (appt: Appointment) => {
    setAppointments((prev) => [...prev, appt]);
    setIsModalOpen(false);
    setModalData(null);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden relative">
      {/* 1. Sidebar (Replicated UI with Responsive Logic) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <header className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-200 bg-white shrink-0 z-10">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:bg-gray-100 p-2 -ml-2 rounded-lg"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            
            {/* Desktop Icon */}
            <span className="text-gray-400 hidden md:block">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
            </span>
            
            <h1 className="text-lg md:text-xl font-medium text-gray-800">Calendario</h1>
            <span className="text-sm text-primary-600 cursor-pointer ml-1 hover:text-primary-700 hidden sm:inline">
              ⓘ ¿Cómo funciona?
            </span>
          </div>
          <button 
            onClick={handleCreateManual}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">Agendar Cita</span>
            <span className="sm:hidden">Agendar +</span>
          </button>
        </header>

        {/* 3. Calendar Grid */}
        <div className="flex-1 overflow-auto bg-white relative">
          <CalendarGrid appointments={appointments} />
        </div>

        {/* 4. Voice Agent (Floating Overlay) */}
        <VoiceAgent onAppointmentParsed={handleVoiceParseResult} />
      </main>

      {/* 5. Appointment Creation/Confirmation Modal */}
      {isModalOpen && (
        <AppointmentModal 
          isOpen={isModalOpen}
          initialData={modalData}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAppointment}
          existingAppointments={appointments}
        />
      )}
    </div>
  );
}