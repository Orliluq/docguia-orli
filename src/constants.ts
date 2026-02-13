import { Appointment, Consultant } from './types';

// Helper to set time relative to today for demo purposes
const today = new Date();
const setTime = (hours: number, minutes: number) => {
  const d = new Date(today);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// Consultants mocked for the dropdown
export const CONSULTANTS: Consultant[] = [
  { id: '1', name: 'Dr. Carlos Parra' },
  { id: '2', name: 'Dra. Ana López' },
  { id: '3', name: 'Carlos Mayaudon' }, // From Screenshot
];

// Initial dummy data to populate the calendar
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Carlos Mayaudon',
    patientName: 'Carlos Mayaudon',
    start: setTime(9, 30), // Today 9:30
    end: setTime(10, 30),
    type: 'consulta',
    notes: 'Primera visita',
    consultantId: '1',
  },
  {
    id: '2',
    title: 'Maria Rodriguez',
    patientName: 'Maria Rodriguez',
    start: setTime(14, 0), // Today 2:00 PM
    end: setTime(15, 0), // Changed to 3:00 PM for 60 min duration
    type: 'control',
    notes: 'Revisión mensual',
    consultantId: '2',
  },
];

export const SERVICE_TYPES = [
  'Consulta General',
  'Limpieza Dental',
  'Ortodoncia',
  'Control',
  'Urgencia'
];