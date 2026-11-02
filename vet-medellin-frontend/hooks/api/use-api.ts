'use client';

import useSWR from 'swr';
import type {
  Dueno, Mascota, Medico, Cita, HistoriaClinica,
  Vacuna, Producto, Factura, AlianzaExterna, Proveedor, Servicio,
  DuenoFormData, MascotaFormData, MedicoFormData, CitaFormData,
  ProductoFormData, HistoriaClinicaFormData, ReporteFinanciero, AlertaVacuna
} from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';

const BACKEND_URL = API_BASE_URL;

const phpRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `Error de API (${response.status})`);
  }
  if (payload === null) {
    throw new Error('El backend devolvió una respuesta vacía o inválida.');
  }
  return payload as T;
};

const phpFetcher = <T>(url: string): Promise<T> => phpRequest<T>(url);

const phpMutation = <T>(url: string, method: string, data?: unknown): Promise<T> =>
  phpRequest<T>(url, {
    method,
    ...(data === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  });

// ===========================================
// Duenos Hook
// ===========================================
export function useDuenos() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Dueno[]>(
    `${BACKEND_URL}/duenos.php`,
    phpFetcher
  );

  const create = async (formData: DuenoFormData) => {
    const result = await phpMutation(`${BACKEND_URL}/duenos.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<DuenoFormData>) => {
    const result = await phpMutation(`${BACKEND_URL}/duenos.php`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/duenos.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { data: data || [], isLoading, error, create, update, remove, refetch: revalidate };
}

// ===========================================
// Mascotas Hook
// ===========================================
export function useMascotas() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Mascota[]>(
    `${BACKEND_URL}/mascotas.php`,
    phpFetcher
  );

  const create = async (formData: MascotaFormData) => {
    const result = await phpMutation(`${BACKEND_URL}/mascotas.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<MascotaFormData>) => {
    const result = await phpMutation(`${BACKEND_URL}/mascotas.php`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/mascotas.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { data: data || [], isLoading, error, create, update, remove, refetch: revalidate };
}

// ===========================================
// Medicos Hook
// ===========================================
export function useMedicos() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Medico[]>(
    `${BACKEND_URL}/medicos.php`,
    phpFetcher
  );

  const create = async (formData: MedicoFormData) => {
    const result = await phpMutation(`${BACKEND_URL}/medicos.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<MedicoFormData>) => {
    const result = await phpMutation(`${BACKEND_URL}/medicos.php`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/medicos.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { data: data || [], isLoading, error, create, update, remove, refetch: revalidate };
}

// ===========================================
// Citas Hook
// ===========================================
export function useCitas() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Cita[]>(
    `${BACKEND_URL}/citas.php`,
    phpFetcher
  );

  const create = async (formData: CitaFormData) => {
    const result = await phpMutation(`${BACKEND_URL}/citas.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<CitaFormData>) => {
    const result = await phpMutation(`${BACKEND_URL}/citas.php`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/citas.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { data: data || [], isLoading, error, create, update, remove, refetch: revalidate };
}

// ===========================================
// Hooks Conectados a la Base de Datos
// ===========================================

export function useVacunas() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Vacuna[]>(
    `${BACKEND_URL}/vacunas.php`,
    phpFetcher
  );
  return { data: data || [], isLoading, error, refetch: revalidate };
}

export function useAlianzas() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<AlianzaExterna[]>(
    `${BACKEND_URL}/alianzas_externas.php`,
    phpFetcher
  );
  return { data: data || [], isLoading, error, refetch: revalidate };
}

export function useReporteFinanciero() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<ReporteFinanciero[]>(
    `${BACKEND_URL}/facturas.php?action=reporte`,
    phpFetcher
  );
  return { data: data || [], isLoading, error, refetch: revalidate };
}

export function useProductos() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Producto[]>(`${BACKEND_URL}/productos.php`, phpFetcher);

  const create = async (formData: ProductoFormData) => {
    const result = await phpMutation(`${BACKEND_URL}/productos.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<ProductoFormData>) => {
    const result = await phpMutation(`${BACKEND_URL}/productos.php?id=${id}`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/productos.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { data: data || [], isLoading, error, create, update, remove, refetch: revalidate };
}

export function useFacturas() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Factura[]>(
    `${BACKEND_URL}/facturas.php`,
    phpFetcher
  );

  const create = async (formData: Omit<Factura, 'id'>) => {
    const result = await phpMutation(`${BACKEND_URL}/facturas.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<Factura>) => {
    const result = await phpMutation(`${BACKEND_URL}/facturas.php`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/facturas.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { 
    data: data || [], 
    isLoading, 
    error, 
    create, 
    update, 
    remove, 
    refetch: revalidate,
    mutate: revalidate   
  };
}

// ===========================================
// Historias Clínicas Hook
// ===========================================
export function useHistorias(mascotaId?: number) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<HistoriaClinica[]>(
    `${BACKEND_URL}/historias.php${mascotaId !== undefined ? `?mascota_id=${mascotaId}` : ''}`,
    phpFetcher
  );

  const create = async (formData: HistoriaClinicaFormData) => {
    const result = await phpMutation(`${BACKEND_URL}/historias.php`, 'POST', formData);
    await revalidate();
    return result;
  };

  const update = async (id: number, formData: Partial<HistoriaClinicaFormData>) => {
    const result = await phpMutation(`${BACKEND_URL}/historias.php`, 'PUT', { id, ...formData });
    await revalidate();
    return result;
  };

  const remove = async (id: number) => {
    await phpMutation(`${BACKEND_URL}/historias.php?id=${id}`, 'DELETE');
    await revalidate();
  };

  return { 
    data: data || [], 
    isLoading, 
    error, 
    create, 
    update, 
    remove, 
    refetch: revalidate 
  };
}
