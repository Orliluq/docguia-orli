export interface Appointment {
  id: string;
  title: string;
  patientName: string;
  start: Date;
  end: Date;
  type: 'consulta' | 'control' | 'urgencia' | 'otro';
  notes?: string;
  consultantId?: string;
  status?: 'confirmed' | 'pending';
}

export interface ParsedAppointmentData {
  patientName: string | null;
  dateStr: string | null; // ISO YYYY-MM-DD
  timeStr: string | null; // HH:mm (24h)
  durationMinutes: number;
  reason: string | null;
  consultantName: string | null;
  ambiguities: string[]; // List of fields the AI wasn't sure about
}

export interface Consultant {
  id: string;
  name: string;
}

export enum VoiceStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
}