import { Appointment } from '../types';

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface ConflictInfo {
  appointment: Appointment;
  conflictingAppointments: Appointment[];
  severity: 'warning' | 'error';
  message: string;
}

// Función para detectar si dos rangos de tiempo se solapan
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.start < slot2.end && slot2.start < slot1.end;
}

// Función para detectar conflictos para una cita específica
export function detectConflicts(
  appointment: Appointment, 
  existingAppointments: Appointment[]
): ConflictInfo | null {
  // Excluir la cita actual de la comparación
  const otherAppointments = existingAppointments.filter(appt => appt.id !== appointment.id);
  
  const conflictingAppointments = otherAppointments.filter(otherAppt => 
    doTimeSlotsOverlap(
      { start: appointment.start, end: appointment.end },
      { start: otherAppt.start, end: otherAppt.end }
    )
  );

  if (conflictingAppointments.length === 0) {
    return null;
  }

  // Determinar severidad basada en el tipo de solapamiento
  const hasExactOverlap = conflictingAppointments.some(otherAppt => 
    appointment.start.getTime() === otherAppt.start.getTime()
  );

  const severity = hasExactOverlap ? 'error' : 'warning';
  
  // Generar mensaje contextual
  const patientNames = conflictingAppointments.map(appt => appt.patientName).join(', ');
  const message = hasExactOverlap 
    ? `Conflicto exacto con cita(s) de: ${patientNames}`
    : `Solapamiento parcial con cita(s) de: ${patientNames}`;

  return {
    appointment,
    conflictingAppointments,
    severity,
    message
  };
}

// Función para encontrar slots disponibles en un día específico
export function findAvailableSlots(
  date: Date,
  existingAppointments: Appointment[],
  durationMinutes: number = 30,
  workStartHour: number = 8,
  workEndHour: number = 18
): Date[] {
  const availableSlots: Date[] = [];
  const workStart = new Date(date);
  workStart.setHours(workStartHour, 0, 0, 0);
  
  const workEnd = new Date(date);
  workEnd.setHours(workEndHour, 0, 0, 0);

  // Obtener todas las citas para el día especificado
  const dayAppointments = existingAppointments.filter(appt => 
    appt.start.toDateString() === date.toDateString()
  ).sort((a, b) => a.start.getTime() - b.start.getTime());

  // Buscar slots disponibles entre citas
  let currentTime = new Date(workStart);
  
  for (const appointment of dayAppointments) {
    // Si hay espacio entre la hora actual y la próxima cita
    if (currentTime.getTime() + durationMinutes * 60000 <= appointment.start.getTime()) {
      availableSlots.push(new Date(currentTime));
    }
    // Mover la hora actual al final de esta cita
    currentTime = new Date(Math.max(currentTime.getTime(), appointment.end.getTime()));
  }

  // Verificar si hay espacio después de la última cita hasta el fin del día laboral
  if (currentTime.getTime() + durationMinutes * 60000 <= workEnd.getTime()) {
    availableSlots.push(new Date(currentTime));
  }

  // Limitar a los próximos 5 slots disponibles para no abrumar al usuario
  return availableSlots.slice(0, 5);
}

// Función para obtener todos los conflictos en un conjunto de citas
export function getAllConflicts(appointments: Appointment[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  
  for (const appointment of appointments) {
    const conflict = detectConflicts(appointment, appointments);
    if (conflict) {
      // Evitar duplicados (solo agregar el conflicto una vez)
      const isDuplicate = conflicts.some(existingConflict => 
        existingConflict.appointment.id === conflict.appointment.id
      );
      
      if (!isDuplicate) {
        conflicts.push(conflict);
      }
    }
  }
  
  return conflicts;
}
