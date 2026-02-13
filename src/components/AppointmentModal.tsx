import React, { useState, useEffect } from 'react';
import { X, Plus, User, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { Appointment, ParsedAppointmentData } from '../types';
import { CONSULTANTS, SERVICE_TYPES } from '../constants';
import { detectConflicts, findAvailableSlots } from '../utils/conflictDetection';
import { ConflictWarning } from './ConflictWarning';

interface Props {
  isOpen: boolean;
  initialData: Partial<ParsedAppointmentData> | null;
  onClose: () => void;
  onSave: (appt: Appointment) => void;
  existingAppointments?: Appointment[];
}

export const AppointmentModal: React.FC<Props> = ({ isOpen, initialData, onClose, onSave, existingAppointments = [] }) => {
  const [patient, setPatient] = useState('');
  const [consultantId, setConsultantId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  
  // UX: Warnings for ambiguous data
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Conflict detection state
  const [currentConflict, setCurrentConflict] = useState<any>(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);

  useEffect(() => {
    if (initialData) {
      setPatient(initialData.patientName || '');
      // Try to match consultant name, else default
      const matchedConsultant = CONSULTANTS.find(c => 
        initialData.consultantName && c.name.toLowerCase().includes(initialData.consultantName.toLowerCase())
      );
      setConsultantId(matchedConsultant ? matchedConsultant.id : '');
      setDate(initialData.dateStr || new Date().toISOString().split('T')[0]);
      setTime(initialData.timeStr || '09:00');
      setDuration(initialData.durationMinutes || 30);
      setNotes(initialData.reason || '');
      setWarnings(initialData.ambiguities || []);
    } else {
      // Defaults for manual entry
      setDate(new Date().toISOString().split('T')[0]);
      setTime('09:00');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!patient || !date || !time) return; // Simple validation

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: `${service || 'Cita'} con ${patient}`,
      patientName: patient,
      start: startDateTime,
      end: endDateTime,
      type: (service as any) || 'consulta',
      notes: notes,
      consultantId: consultantId,
      status: 'confirmed'
    };
    
    // Check for conflicts before saving
    const conflict = detectConflicts(newAppointment, existingAppointments);
    if (conflict) {
      setCurrentConflict(conflict);
      setAvailableSlots(findAvailableSlots(startDateTime, existingAppointments, duration));
      setShowConflictWarning(true);
      return;
    }
    
    onSave(newAppointment);
  };
  const handleConflictResolve = (suggestedTime?: Date) => {
    setShowConflictWarning(false);
    
    if (suggestedTime) {
      // Update time with suggested slot
      const newTime = suggestedTime.toTimeString().slice(0, 5);
      setTime(newTime);
      
      // Recreate appointment with new time
      const startDateTime = new Date(`${date}T${newTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        title: `${service || 'Cita'} con ${patient}`,
        patientName: patient,
        start: startDateTime,
        end: endDateTime,
        type: (service as any) || 'consulta',
        notes: notes,
        consultantId: consultantId,
        status: 'confirmed'
      };
      
      onSave(newAppointment);
    } else {
      // Save anyway despite conflict
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        title: `${service || 'Cita'} con ${patient}`,
        patientName: patient,
        start: startDateTime,
        end: endDateTime,
        type: (service as any) || 'consulta',
        notes: notes,
        consultantId: consultantId,
        status: 'confirmed'
      };
      
      onSave(newAppointment);
    }
  };

  const isFieldAmbiguous = (field: string) => warnings.some(w => w.toLowerCase().includes(field));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 backdrop-blur-sm transition-opacity">
      {/* Drawer Container */}
      <div className="bg-white w-full md:max-w-[500px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Agendar nueva cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Ambiguity Alert */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Por favor verifica los datos.</p>
                <p className="text-amber-700/80 text-xs mt-1">
                  Detectamos ambigüedad en: {warnings.join(', ')}. Hemos asumido valores por defecto.
                </p>
              </div>
            </div>
          )}

          {/* Patient Input */}
          <div className={`space-y-1.5 ${isFieldAmbiguous('patient') ? 'animate-pulse' : ''}`}>
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Paciente <span className="text-red-500">*</span></label>
              <button className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                   Añadir paciente <Plus size={12}/>
                </button>
             </div>
             <div className="relative">
               <input 
                  type="text" 
                  value={patient}
                  onChange={e => setPatient(e.target.value)}
                  placeholder="Buscar paciente"
                  className={`w-full border ${isFieldAmbiguous('patient') ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-200'} rounded-lg pl-3 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 bg-white`}
               />
               <div className="absolute right-3 top-2.5 text-gray-400"><User size={18}/></div>
             </div>
          </div>

          {/* Consultant Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Consultorio <span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                value={consultantId}
                onChange={e => setConsultantId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white appearance-none cursor-pointer text-gray-700"
              >
                <option value="">Selecciona un consultorio</option>
                {CONSULTANTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Fecha <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className={`w-full border ${isFieldAmbiguous('date') ? 'border-amber-400' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-700 bg-white`}
                  />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Hora <span className="text-red-500">*</span></label>
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className={`w-full border ${isFieldAmbiguous('time') ? 'border-amber-400' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-700 bg-white`}
                />
             </div>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Servicios</label>
            <div className="relative">
                <select 
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white appearance-none cursor-pointer text-gray-700"
                >
                  <option value="">Seleccionar servicios...</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Duración de la cita</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow bg-white">
               <input 
                 type="number"
                 value={duration}
                 onChange={e => setDuration(parseInt(e.target.value))}
                 className="flex-1 px-3 py-2.5 text-sm outline-none text-gray-700 bg-white"
               />
               <div className="bg-white text-gray-400 px-3 border-l border-gray-200 flex flex-col gap-0.5">
                  <button onClick={() => setDuration(d => d + 5)} className="hover:text-primary-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg></button>
                  <button onClick={() => setDuration(d => Math.max(5, d - 5))} className="hover:text-primary-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></button>
               </div>
               <span className="bg-white text-gray-500 px-3 py-2.5 text-sm border-l border-gray-200 font-medium">min</span>
            </div>
          </div>

          {/* Links / Extras */}
          <div className="space-y-3 pt-2">
            <div>
              <button className="text-sm text-primary-600 font-medium flex items-center gap-1.5 hover:text-primary-700">
                <Plus size={16} /> Añadir notas internas
                </button>
            </div>
            {notes && (
               <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Escribe aquí las notas..."
                rows={3}
               />
            )}
            <div>
                <button className="text-sm text-primary-600 font-medium flex items-center gap-1.5 hover:text-primary-700">
                <Plus size={16} /> Añadir Motivo de consulta
                </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-4 shrink-0 bg-white">
          <button 
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-primary-300 text-white font-medium py-2.5 rounded-lg hover:bg-primary-400 transition-colors shadow-sm"
          >
            Agendar cita
          </button>
        </div>
        
        {/* Conflict Warning Overlay */}
        {showConflictWarning && currentConflict && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-60 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
              <ConflictWarning 
                conflict={currentConflict}
                onResolve={handleConflictResolve}
                showSuggestions={true}
                availableSlots={availableSlots}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};