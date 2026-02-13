import React from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  CreditCard, 
  Bell, 
  Gift, 
  Settings, 
  LayoutTemplate, 
  Puzzle,
  ChevronUp,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 h-full bg-white border-r border-gray-100 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:flex shrink-0
        `}
      >
        {/* Brand & Mobile Close */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary-600">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
            </svg>
            <span className="text-xl font-bold tracking-tight text-primary-600">DocGuía</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <NavItem icon={<Home size={20} />} label="Inicio" />
          <NavItem icon={<Calendar size={20} />} label="Calendario" active />
          <NavItem icon={<Users size={20} />} label="Pacientes" />
          <NavItem icon={<CreditCard size={20} />} label="Cobros" />

          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gestión</p>
            <NavItem icon={<Bell size={20} />} label="Recordatorios" />
            <NavItem icon={<Gift size={20} />} label="Referidos" />
          </div>

          <div className="pt-4 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configuración</p>
            <NavItem icon={<Settings size={20} />} label="Consultorios" />
            <NavItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Servicios" />
            <NavItem icon={<LayoutTemplate size={20} />} label="Plantillas" />
          </div>
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="bg-primary-50 rounded-xl p-3 mb-3">
             <div className="flex items-center gap-2 text-primary-700 text-sm font-medium">
               <div className="p-1"><Puzzle size={16} /></div>
               <div>
                  <p>Cuenta Demo</p>
                  <p className="text-xs text-primary-500 font-normal">Acceso ilimitado</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-sm font-bold">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">Dr. Carlos Parra</p>
            </div>
            <ChevronUp size={16} className="text-gray-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={active ? 'text-primary-600' : 'text-gray-400'}>{icon}</span>
      {label}
    </a>
  );
};