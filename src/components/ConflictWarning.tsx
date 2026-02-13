import React from 'react';
import { AlertTriangle, Clock, Users, ChevronRight } from 'lucide-react';
import { ConflictInfo } from '../utils/conflictDetection';

interface ConflictWarningProps {
  conflict: ConflictInfo;
  onResolve?: (suggestedTime?: Date) => void;
  showSuggestions?: boolean;
  availableSlots?: Date[];
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({ 
  conflict, 
  onResolve, 
  showSuggestions = false,
  availableSlots = []
}) => {
  const severityColors = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const severityIcons = {
    warning: <AlertTriangle size={16} className="text-yellow-600" />,
    error: <AlertTriangle size={16} className="text-red-600" />
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`rounded-lg border p-3 mb-3 ${severityColors[conflict.severity]}`}>
      <div className="flex items-start gap-2">
        {severityIcons[conflict.severity]}
        <div className="flex-1">
          <p className="font-medium text-sm">{conflict.message}</p>
          
          {/* Mostrar detalles de las citas conflictivas */}
          <div className="mt-2 space-y-1">
            {conflict.conflictingAppointments.map((conflictAppt, index) => (
              <div key={conflictAppt.id} className="flex items-center gap-2 text-xs opacity-90">
                <Users size={12} />
                <span>{conflictAppt.patientName}</span>
                <span>•</span>
                <Clock size={12} />
                <span>
                  {formatTime(conflictAppt.start)} - {formatTime(conflictAppt.end)}
                </span>
              </div>
            ))}
          </div>

          {/* Sugerencias de horarios alternativos */}
          {showSuggestions && availableSlots.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <p className="text-xs font-medium mb-2">Horarios alternativos disponibles:</p>
              <div className="space-y-1">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => onResolve?.(slot)}
                    className="w-full flex items-center justify-between p-2 rounded bg-white bg-opacity-50 hover:bg-opacity-70 transition-colors text-xs"
                  >
                    <span>
                      {formatDate(slot)} • {formatTime(slot)}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onResolve?.()}
              className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-70 rounded text-xs font-medium transition-colors"
            >
              Ignorar conflicto
            </button>
            {showSuggestions && availableSlots.length === 0 && (
              <button
                onClick={() => onResolve?.()}
                className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-70 rounded text-xs font-medium transition-colors"
              >
                Buscar otro día
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
