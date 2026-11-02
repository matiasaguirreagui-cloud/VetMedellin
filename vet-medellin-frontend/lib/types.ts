// ===========================================
// VetMedellin - TypeScript Interfaces
// ===========================================

// Duenos (Pet Owners)
export interface Dueno {
  id: number;
  dni_cedula: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  created_at: string;
}

// Mascotas (Pets)
export interface Mascota {
  id: number;
  nombre: string;
  especie: 'Canino' | 'Felino' | 'Equino' | 'Ave' | 'Exotico';
  raza: string;
  dueno_id: number;
  fecha_nacimiento: string | null;
  sexo: 'Macho' | 'Hembra' | 'Desconocido' | null;
  color: string | null;
  microchip: string | null;
  peso_actual: number | null;
  esterilizado: boolean;
  foto_url: string | null;
  activo: boolean;
  // Joined fields
  dueno_nombre?: string;
  dueno_apellido?: string;
}

// Medicos (Veterinarians)
export interface Medico {
  id: number;
  tarjeta_profesional: string;
  nombre: string;
  apellido: string;
  especialidad: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

// Citas (Appointments)
export interface Cita {
  id: number;
  mascota_id: number;
  medico_id: number;
  fecha_hora: string;
  motivo: string | null;
  estado: 'Programada' | 'Confirmada' | 'En Sala' | 'Atendida' | 'Cancelada';
  // Joined fields
  mascota_nombre?: string;
  medico_nombre?: string;
  medico_apellido?: string;
  dueno_nombre?: string;
}

// Historias Clinicas (Medical Records)
export interface HistoriaClinica {
  id: number;
  mascota_id: number;
  medico_id: number;
  fecha: string;
  motivo_consulta: string;
  sintomas: string;
  examen_physico: string;
  peso: number;
  temperatura: number;
  frecuencia_cardiaca: number;
  frecuencia_respiratoria: number;
  diagnostico: string;
  tratamiento: string;
}

export type HistoriaFormData = Omit<HistoriaClinica, 'id' | 'fecha'>;

// Vacunas (Vaccines)
export interface Vacuna {
  id: number;
  nombre_vacuna: string;
  dias_validez: number | null;
}

// Registro Vacunacion (Vaccination Records)
export interface RegistroVacunacion {
  id: number;
  mascota_id: number;
  vacuna_id: number;
  medico_id: number;
  fecha_aplicacion: string;
  fecha_refuerzo: string | null;
  lote: string | null;
  // Joined fields
  vacuna_nombre?: string;
  medico_nombre?: string;
}

// Productos (Products)
export interface Producto {
  id: number;
  codigo_barras: string | null;
  nombre: string;
  descripcion: string | null;
  proveedor_id: number | null;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  // Joined fields
  proveedor_nombre?: string;
}

// Facturas (Invoices)
export interface Factura {
  id: number;
  dueno_id: number;
  fecha_emision: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado_pago: 'Pendiente' | 'Pagada' | 'Anulada';
  metodo_pago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | null;
  // Joined fields
  dueno_nombre?: string;
  dueno_apellido?: string;
}

// Detalle Factura (Invoice Details)
export interface DetalleFactura {
  id: number;
  factura_id: number;
  producto_id: number | null;
  servicio_id: number | null;
  cantidad: number;
  precio_unitario: number;
  // Joined fields
  producto_nombre?: string;
  servicio_nombre?: string;
}

// Alianzas Externas (Partner Clinics)
export interface AlianzaExterna {
  id: number;
  nombre_entidad: string;
  tipo: 'Laboratorio' | 'Especialista' | 'Funeraria' | 'Transporte' | null;
  convenio_detalles: string | null;
  telefono: string | null;
  activo: boolean;
}

// Proveedores (Suppliers)
export interface Proveedor {
  id: number;
  nit_tax_id: string;
  nombre_empresa: string;
  contacto_nombre: string | null;
  telefono: string | null;
  email: string | null;
}

// Servicios (Services)
export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Financial Report
export interface ReporteFinanciero {
  mes: string;
  anio: number;
  total_ingresos: number;
  total_facturas: number;
}

// Vaccination Alert
export interface AlertaVacuna {
  nombre_mascota: string;
  nombre_vacuna: string;
  fecha_refuerzo: string;
  nombre_dueno: string;
  telefono_dueno: string;
  email_dueno: string;
  dias_restantes?: number;
}

// Form Types for CRUD operations
export type DuenoFormData = Omit<Dueno, 'id' | 'created_at'>;
export type MascotaFormData = Omit<Mascota, 'id' | 'dueno_nombre' | 'dueno_apellido'>;
export type MedicoFormData = Omit<Medico, 'id'>;
export type CitaFormData = Omit<Cita, 'id' | 'mascota_nombre' | 'medico_nombre' | 'medico_apellido' | 'dueno_nombre'>;
export type ProductoFormData = Omit<Producto, 'id' | 'proveedor_nombre'>;

// Tipo exacto para lo que el backend espera recibir
export type HistoriaClinicaFormData = Omit<HistoriaClinica, 'id' | 'medico_tratante' | 'historial_vacunacion_global' | 'motivo_cita_original'>;

// Tipo extendido para que el formulario controle los inputs numéricos y campos adicionales sin conflictos
export interface HistoriaFormState {
  mascota_id: number;
  medico_id: number;
  cita_id: number | null;
  fecha_consulta: string;
  motivo_consulta: string;
  sintomas: string;
  examen_fisico: string;
  diagnostico: string;
  plan_tratamiento: string;
  proxima_revision: string | null;
  // Signos vitales que en el input pueden ser string vacío '' o un número
  peso: number | '';
  temperatura: number | '';
  frecuencia_cardiaca: number | '';
  frecuencia_respiratoria: number | '';
}