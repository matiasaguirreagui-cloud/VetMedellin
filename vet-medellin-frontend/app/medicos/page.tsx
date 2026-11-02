'use client';

import { useState } from 'react';
import { DataGrid, type Column } from '@/components/data-grid/data-grid';
import { CrudModal, DeleteConfirmModal, type FormField } from '@/components/modals/crud-modal';
import { useMedicos } from '@/hooks/api/use-api';
import { useToast } from '@/context/toast-context';
import { Badge } from '@/components/ui/badge';
import type { Medico } from '@/lib/types';

export default function MedicosPage() {
  const { data: medicos, isLoading, create, update, remove } = useMedicos();
  const { showToast } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns: Column<Medico>[] = [
    { key: 'tarjeta_profesional', label: 'Tarjeta Profesional', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'apellido', label: 'Apellido', sortable: true },
    { key: 'especialidad', label: 'Especialidad', sortable: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    {
      key: 'activo',
      label: 'Estado',
      render: (medico) => (
        <Badge variant={medico.activo ? 'default' : 'secondary'} className={medico.activo ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}>
          {medico.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  // Configuración de los campos dinámicos del Formulario
  const formFields: FormField[] = [
    { name: 'tarjeta_profesional', label: 'Tarjeta Profesional (Formato: TP-XXXXX)', type: 'text', required: true },
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true },
    { name: 'especialidad', label: 'Especialidad', type: 'text', required: false },
    { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
    { name: 'email', label: 'Email', type: 'text', required: false },
    { name: 'activo', label: 'Estado Activo', type: 'boolean', required: false }
  ];

  const handleCreate = () => {
    setSelectedMedico(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (medico: Medico) => {
    setSelectedMedico(medico);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (medico: Medico) => {
    setSelectedMedico(medico);
    // Para abrir el modal de eliminación directamente usamos un estado booleano dedicado como tenías
    setIsDeleteModalOpen(true);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const validateTarjetaProfesional = (tarjeta: string): boolean => {
    const pattern = /^TP-\d{5}$/;
    return pattern.test(tarjeta);
  };

  // Función unificada que recibe los datos procesados directamente desde el CrudModal
  const handleSubmit = async (data: any) => {
    if (!validateTarjetaProfesional(data.tarjeta_profesional)) {
      showToast('La tarjeta profesional debe tener el formato TP-XXXXX', 'error');
      return;
    }
    if (!data.nombre || !data.apellido) {
      showToast('Nombre y apellido son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await create(data);
        showToast('Médico creado correctamente', 'success');
      } else if (modalMode === 'edit' && selectedMedico) {
        await update(selectedMedico.id, data);
        showToast('Médico actualizado correctamente', 'success');
      }
      setModalOpen(false);
      setSelectedMedico(null);
    } catch (error) {
      showToast(`Error al guardar el médico`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedico) return;
    setIsSubmitting(true);
    try {
      await remove(selectedMedico.id);
      showToast('Médico eliminado correctamente', 'success');
      setIsDeleteModalOpen(false);
      setSelectedMedico(null);
    } catch (error) {
      showToast('Error al eliminar el médico', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DataGrid
        title="Médicos"
        data={medicos || []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={['nombre', 'apellido', 'tarjeta_profesional', 'especialidad']}
        searchPlaceholder="Buscar por nombre, apellido, tarjeta o especialidad..."
        onCreate={handleCreate}
        createLabel="Nuevo Médico"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay médicos registrados"
      />

      {/* Modal único e inteligente para Crear y Editar */}
      <CrudModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        title="Médico"
        description={modalMode === 'create' ? "Ingresa los datos del nuevo médico veterinario." : "Modifica los datos del médico."}
        fields={formFields}
        data={selectedMedico || undefined}
        onSubmit={handleSubmit}
        submitLabel={modalMode === 'create' ? 'Guardar' : 'Actualizar'}
        isSubmitting={isSubmitting}
        size="md"
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar Médico"
        description={`¿Está seguro de eliminar al médico ${selectedMedico?.nombre} ${selectedMedico?.apellido}? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
}