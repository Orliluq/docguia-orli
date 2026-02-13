import React, { useState, useMemo } from 'react';
import { Appointment } from '../types';
import { detectConflicts, findAvailableSlots } from '../utils/conflictDetection';
import { ConflictWarning } from './ConflictWarning';

interface CalendarGridProps {
  appointments: Appointment[];
}

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 8 AM to 6 PM
const DAYS = [
  { name: 'Dom', date: 8 },
  { name: 'Lun', date: 9, isToday: true },
  { name: 'Mar', date: 10 },
  { name: 'Mié', date: 11 },
  { name: 'Jue', date: 12 },
  { name: 'Vie', date: 13 },
  { name: 'Sáb', date: 14 },
];

export const CalendarGrid: React.FC<CalendarGridProps> = ({ appointments }) => {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  
  // Calcular conflictos para todas las citas
  const appointmentsWithConflicts = useMemo(() => {
    return appointments.map(appt => ({
      ...appt,
      conflict: detectConflicts(appt, appointments)
    }));
  }, [appointments]);
  
  // Helper to position appointments absolutely based on time
  const getAppointmentStyle = (appt: Appointment) => {
    const startHour = appt.start.getHours();
    const startMin = appt.start.getMinutes();
    const endHour = appt.end.getHours();
    const endMin = appt.end.getMinutes();

    // Calendar starts at 8:00 AM. 1 Hour = 64px (h-16)
    const startOffset = (startHour - 8) * 64 + (startMin / 60) * 64;
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const height = (durationMinutes / 60) * 64;

    return {
      top: `${startOffset}px`,
      height: `${height}px`,
    };
  };

  const getColumnAppointments = (dayIndex: number) => {
    // 0 = Sunday, 1 = Monday...
    return appointments.filter(appt => appt.start.getDay() === dayIndex);
  };

  return (
    <div className="flex flex-col h-full min-w-full">
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-white sticky top-0 z-20 gap-3">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex bg-white border border-gray-200 rounded-md p-1 shadow-sm shrink-0">
             <button className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">Hoy</button>
          </div>
          <div className="flex items-center gap-2 text-gray-600 shrink-0">
             <button className="p-1 hover:bg-gray-100 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
             <span className="text-sm font-medium whitespace-nowrap">8 - 14 Feb 2026</span>
             <button className="p-1 hover:bg-gray-100 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
          {/* Spacer for mobile justify-between */}
          <div className="md:hidden"></div> 
        </div>

        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
           <div className="flex bg-gray-100 rounded-lg p-1 text-sm shrink-0">
              <button className="px-2 md:px-3 py-1 bg-white shadow rounded-md text-primary-600 font-medium">Semana</button>
              <button className="px-2 md:px-3 py-1 text-gray-500 hover:text-gray-700">Día</button>
              <button className="px-2 md:px-3 py-1 text-gray-500 hover:text-gray-700">Lista</button>
           </div>
           
           <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 md:px-3 py-1.5 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 shrink-0 whitespace-nowrap">
             <span className="w-2 h-2 rounded-full bg-primary-500"></span>
             <span className="hidden sm:inline">Todos los consultorios</span>
             <span className="sm:hidden">Consultorios</span>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
           </div>
           
           <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 md:px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 shrink-0">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
             <span className="hidden sm:inline">Filtros</span>
           </button>
        </div>
      </div>

      {/* Scrollable Container for Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px] flex flex-col h-full"> {/* Enforce min-width for calendar integrity */}
          
          {/* Grid Header */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <div className="w-16 md:w-20 shrink-0 p-4 text-xs font-medium text-gray-500 text-center border-r border-gray-100">
              Horario
            </div>
            {DAYS.map((day, idx) => (
              <div key={idx} className="flex-1 py-3 text-center border-r border-gray-100 last:border-r-0">
                 <div className="flex flex-col items-center justify-center gap-1">
                   <span className="text-xs font-medium text-gray-500 uppercase">{day.name}</span>
                   <span className={`text-sm font-semibold flex items-center justify-center w-8 h-8 rounded-full ${day.isToday ? 'bg-primary-500 text-white shadow-md' : 'text-gray-700'}`}>
                     {day.date}
                   </span>
                   {day.isToday && <div className="h-1 w-full bg-red-400 absolute bottom-0 left-0 right-0" />} 
                 </div>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex relative bg-white flex-1">
            {/* Time Sidebar */}
            <div className="w-16 md:w-20 shrink-0 border-r border-gray-100 bg-white z-10">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-gray-50 text-xs text-gray-400 flex items-start justify-center pt-2 relative">
                   <span className="-translate-y-1/2 bg-white px-1">
                     {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                   </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((day, dayIndex) => (
              <div key={dayIndex} className="flex-1 border-r border-gray-100 last:border-r-0 relative">
                 {/* Horizontal Hour Lines */}
                 {HOURS.map(hour => (
                    <div key={hour} className="h-16 border-b border-gray-50"></div>
                 ))}

                 {/* Current Time Indicator (Red line) - Only on Today */}
                 {day.isToday && (
                   <div className="absolute top-[80px] w-full border-t-2 border-red-400 z-10 shadow-sm"></div>
                 )}

                 {/* Appointments with Conflict Detection */}
                 {getColumnAppointments(dayIndex).map(appt => {
                   const conflict = detectConflicts(appt, appointments);
                   const style = getAppointmentStyle(appt);
                   const hasConflict = !!conflict;
                   
                   return (
                     <div
                       key={appt.id}
                       style={style}
                       className={`absolute left-1 right-1 rounded px-1 md:px-2 py-1 text-xs shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden z-0 ${
                         hasConflict 
                           ? 'bg-red-50 border-l-4 border-red-500 hover:bg-red-100' 
                           : 'bg-primary-50 border-l-4 border-primary-500 hover:bg-primary-100'
                       }`}
                       onClick={() => hasConflict && setSelectedConflict(
                         selectedConflict === appt.id ? null : appt.id
                       )}
                     >
                       <div className="flex items-center justify-between">
                         <div className="font-semibold truncate flex-1">
                           {hasConflict ? (
                             <span className="text-red-800">{appt.title}</span>
                           ) : (
                             <span className="text-primary-800">{appt.title}</span>
                           )}
                         </div>
                         {hasConflict && (
                           <span className="text-red-500 text-xs">⚠️</span>
                         )}
                       </div>
                       <div className={`${hasConflict ? 'text-red-600' : 'text-primary-600'} hidden md:block`}>
                         {appt.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {appt.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                       
                       {/* Conflict Warning Popup */}
                       {hasConflict && selectedConflict === appt.id && (
                         <div className="absolute bottom-full left-0 right-0 mb-2 z-20">
                           <ConflictWarning 
                             conflict={conflict!}
                             onResolve={(suggestedTime) => {
                               if (suggestedTime) {
                                 // Aquí podrías actualizar la cita con el nuevo horario
                                 console.log('Resolving conflict with suggested time:', suggestedTime);
                               }
                               setSelectedConflict(null);
                             }}
                             showSuggestions={true}
                             availableSlots={findAvailableSlots(
                               appt.start, 
                               appointments.filter(a => a.id !== appt.id),
                               30
                             )}
                           />
                         </div>
                       )}
                     </div>
                   );
                 })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};