// ===========================================
// VetMedellin - Constants
// ===========================================

export const APP_NAME = 'VetMedellin';
export const APP_DESCRIPTION = 'Sistema de Gestion Veterinaria';

// Especies disponibles
export const ESPECIES = [
  { value: 'Canino', label: 'Canino' },
  { value: 'Felino', label: 'Felino' },
  { value: 'Equino', label: 'Equino' },
  { value: 'Ave', label: 'Ave' },
  { value: 'Exotico', label: 'Exotico' },
] as const;

// Sexos
export const SEXOS = [
  { value: 'Macho', label: 'Macho' },
  { value: 'Hembra', label: 'Hembra' },
  { value: 'Desconocido', label: 'Desconocido' },
] as const;

// Estados de cita
export const ESTADOS_CITA = [
  { value: 'Programada', label: 'Programada', color: 'bg-blue-100 text-blue-800' },
  { value: 'Confirmada', label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  { value: 'En Sala', label: 'En Sala', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Atendida', label: 'Atendida', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'Cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
] as const;

// Estados de pago
export const ESTADOS_PAGO = [
  { value: 'Pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Pagada', label: 'Pagada', color: 'bg-green-100 text-green-800' },
  { value: 'Anulada', label: 'Anulada', color: 'bg-red-100 text-red-800' },
] as const;

// Metodos de pago
export const METODOS_PAGO = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Tarjeta', label: 'Tarjeta' },
  { value: 'Transferencia', label: 'Transferencia' },
] as const;

// Tipos de alianzas
export const TIPOS_ALIANZA = [
  { value: 'Laboratorio', label: 'Laboratorio' },
  { value: 'Especialista', label: 'Especialista' },
  { value: 'Funeraria', label: 'Funeraria' },
  { value: 'Transporte', label: 'Transporte' },
] as const;

// Navigation items
export const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: 'Home' },
  { href: '/medicos', label: 'Medicos', icon: 'Stethoscope' },
  { href: '/mascotas', label: 'Mascotas', icon: 'PawPrint' },
  { href: '/duenos', label: 'Duenos', icon: 'Users' },
  { href: '/citas', label: 'Citas', icon: 'Calendar' },
  { href: '/historias', label: 'Historias Clinicas', icon: 'ClipboardList' },
  { href: '/facturas', label: 'Facturas', icon: 'Receipt' },
  { href: '/productos', label: 'Productos', icon: 'Package' },
] as const;

// Color palette
export const COLORS = {
  primary: {
    green: '#86EFAC',
    greenLight: '#BBF7D0',
    blue: '#93C5FD',
    blueLight: '#BFDBFE',
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
} as const;

// Chart colors
export const CHART_COLORS = [
  'hsl(142, 76%, 73%)', // Green
  'hsl(213, 94%, 78%)', // Blue
  'hsl(45, 93%, 63%)',  // Yellow
  'hsl(0, 84%, 71%)',   // Red
  'hsl(262, 83%, 75%)', // Purple
] as const;
