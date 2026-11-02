// ===========================================
// VetMedellin - API Configuration
// ===========================================

// Base URL for PHP API - configure this to your local PHP server
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

// Generic fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }

  return response.json();
}

// CRUD helper functions
export const apiEndpoints = {
  // Duenos
  duenos: {
    getAll: () => apiFetch<{ data: import('./types').Dueno[] }>('/duenos.php'),
    getById: (id: number) => apiFetch<{ data: import('./types').Dueno }>(`/duenos.php?id=${id}`),
    create: (data: import('./types').DuenoFormData) => 
      apiFetch<{ data: import('./types').Dueno }>('/duenos.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('./types').DuenoFormData>) =>
      apiFetch<{ data: import('./types').Dueno }>(`/duenos.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ success: boolean }>(`/duenos.php?id=${id}`, {
        method: 'DELETE',
      }),
  },

  // Mascotas
  mascotas: {
    getAll: () => apiFetch<{ data: import('./types').Mascota[] }>('/mascotas.php'),
    getById: (id: number) => apiFetch<{ data: import('./types').Mascota }>(`/mascotas.php?id=${id}`),
    create: (data: import('./types').MascotaFormData) =>
      apiFetch<{ data: import('./types').Mascota }>('/mascotas.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('./types').MascotaFormData>) =>
      apiFetch<{ data: import('./types').Mascota }>(`/mascotas.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ success: boolean }>(`/mascotas.php?id=${id}`, {
        method: 'DELETE',
      }),
  },

  // Medicos
  medicos: {
    getAll: () => apiFetch<{ data: import('./types').Medico[] }>('/medicos.php'),
    getById: (id: number) => apiFetch<{ data: import('./types').Medico }>(`/medicos.php?id=${id}`),
    create: (data: import('./types').MedicoFormData) =>
      apiFetch<{ data: import('./types').Medico }>('/medicos.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('./types').MedicoFormData>) =>
      apiFetch<{ data: import('./types').Medico }>(`/medicos.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ success: boolean }>(`/medicos.php?id=${id}`, {
        method: 'DELETE',
      }),
  },

  // Citas
  citas: {
    getAll: () => apiFetch<{ data: import('./types').Cita[] }>('/citas.php'),
    getById: (id: number) => apiFetch<{ data: import('./types').Cita }>(`/citas.php?id=${id}`),
    create: (data: import('./types').CitaFormData) =>
      apiFetch<{ data: import('./types').Cita }>('/citas.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('./types').CitaFormData>) =>
      apiFetch<{ data: import('./types').Cita }>(`/citas.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ success: boolean }>(`/citas.php?id=${id}`, {
        method: 'DELETE',
      }),
  },

  // Historias Clinicas
  historias: {
    getAll: () => apiFetch<{ data: import('./types').HistoriaClinica[] }>('/historias.php'),
    getByMascota: (mascotaId: number) => 
      apiFetch<{ data: import('./types').HistoriaClinica[] }>(`/historias.php?mascota_id=${mascotaId}`),
    create: (data: import('./types').HistoriaClinicaFormData) =>
      apiFetch<{ data: import('./types').HistoriaClinica }>('/historias.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cerrarCita: (data: {
      mascota_id: number;
      medico_id: number;
      cita_id: number;
      motivo_consulta: string;
      sintomas: string;
      examen_fisico: string;
      diagnostico: string;
      plan_tratamiento: string;
      proxima_revision: string;
    }) =>
      apiFetch<{ success: boolean }>('/historias.php?action=cerrar_cita', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Vacunas
  vacunas: {
    getAll: () => apiFetch<{ data: import('./types').Vacuna[] }>('/vacunas.php'),
    getAlertas: () => apiFetch<{ data: import('./types').AlertaVacuna[] }>('/vacunas.php?action=alertas'),
  },

  // Productos
  productos: {
    getAll: () => apiFetch<{ data: import('./types').Producto[] }>('/productos.php'),
    getById: (id: number) => apiFetch<{ data: import('./types').Producto }>(`/productos.php?id=${id}`),
    create: (data: import('./types').ProductoFormData) =>
      apiFetch<{ data: import('./types').Producto }>('/productos.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('./types').ProductoFormData>) =>
      apiFetch<{ data: import('./types').Producto }>(`/productos.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ success: boolean }>(`/productos.php?id=${id}`, {
        method: 'DELETE',
      }),
  },

  // Facturas
  facturas: {
    getAll: () => apiFetch<{ data: import('./types').Factura[] }>('/facturas.php'),
    getById: (id: number) => apiFetch<{ data: import('./types').Factura }>(`/facturas.php?id=${id}`),
    getReporteFinanciero: () => 
      apiFetch<{ data: import('./types').ReporteFinanciero[] }>('/facturas.php?action=reporte'),
    create: (data: Omit<import('./types').Factura, 'id' | 'dueno_nombre' | 'dueno_apellido'>) =>
      apiFetch<{ data: import('./types').Factura }>('/facturas.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Alianzas Externas
  alianzas: {
    getAll: () => apiFetch<{ data: import('./types').AlianzaExterna[] }>('/alianzas.php'),
  },

  // Proveedores
  proveedores: {
    getAll: () => apiFetch<{ data: import('./types').Proveedor[] }>('/proveedores.php'),
  },

  // Servicios
  servicios: {
    getAll: () => apiFetch<{ data: import('./types').Servicio[] }>('/servicios.php'),
  },
};
