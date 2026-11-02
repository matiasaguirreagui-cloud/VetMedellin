'use client';

import { useState } from 'react';
import { DataGrid, type Column } from '@/components/data-grid/data-grid';
import { CrudModal, DeleteConfirmModal } from '@/components/modals/crud-modal';
import { useDuenos } from '@/hooks/api/use-api';
import { useToast } from '@/context/toast-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Dueno, DuenoFormData } from '@/lib/types';

// Se extrae FormFields fuera para que los inputs no pierdan el foco ni bloqueen el copiado/pegado
interface FormFieldsProps {
  formData: DuenoFormData;
  setFormData: React.Dispatch<React.SetStateAction<DuenoFormData>>;
}

const FormFields = ({ formData, setFormData }: FormFieldsProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="dni_cedula">Cedula/DNI *</Label>
      <Input
        id="dni_cedula"
        placeholder="1020304050"
        value={formData.dni_cedula}
        onChange={(e) => setFormData({ ...formData, dni_cedula: e.target.value })}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          placeholder="Carlos"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apellido">Apellido *</Label>
        <Input
          id="apellido"
          placeholder="Gomez"
          value={formData.apellido}
          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="telefono">Telefono</Label>
        <Input
          id="telefono"
          placeholder="3101234567"
          value={formData.telefono || ''}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="carlos@email.com"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '') })}
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="direccion">Direccion</Label>
      <Textarea
        id="direccion"
        placeholder="Calle 50 #30-20"
        value={formData.direccion || ''}
        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
        rows={2}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="ciudad">Ciudad</Label>
      <Input
        id="ciudad"
        placeholder="Medellin"
        value={formData.ciudad || ''}
        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
      />
    </div>
  </div>
);

export default function DuenosPage() {
  const { data: duenos, isLoading, create, update, remove } = useDuenos();
  const { showToast } = useToast();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDueno, setSelectedDueno] = useState<Dueno | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<DuenoFormData>({
    dni_cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
  });

  const columns: Column<Dueno>[] = [
    { key: 'dni_cedula', label: 'Cedula/DNI', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'apellido', label: 'Apellido', sortable: true },
    { key: 'telefono', label: 'Telefono' },
    { key: 'email', label: 'Email' },
    { key: 'ciudad', label: 'Ciudad', sortable: true },
  ];

  const resetForm = () => {
    setFormData({
      dni_cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (dueno: Dueno) => {
    setSelectedDueno(dueno);
    setFormData({
      dni_cedula: dueno.dni_cedula,
      nombre: dueno.nombre,
      apellido: dueno.apellido,
      telefono: dueno.telefono || '',
      email: dueno.email || '',
      direccion: dueno.direccion || '',
      ciudad: dueno.ciudad || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (dueno: Dueno) => {
    setSelectedDueno(dueno);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.dni_cedula || !formData.nombre || !formData.apellido) {
      showToast('Cedula, nombre y apellido son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await create(formData);
      showToast('Dueno creado correctamente', 'success');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al crear el dueno', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedDueno) return;
    if (!formData.dni_cedula || !formData.nombre || !formData.apellido) {
      showToast('Cedula, nombre y apellido son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await update(selectedDueno.id, formData);
      showToast('Dueno actualizado correctamente', 'success');
      setIsEditModalOpen(false);
      setSelectedDueno(null);
    } catch (error) {
      showToast('Error al actualizar el dueno', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDueno) return;

    setIsSubmitting(true);
    try {
      await remove(selectedDueno.id);
      showToast('Dueno eliminado correctamente', 'success');
      setIsDeleteModalOpen(false);
      setSelectedDueno(null);
    } catch (error) {
      showToast('Error al eliminar el dueno', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DataGrid
        title="Duenos"
        data={duenos}
        columns={columns}
        isLoading={isLoading}
        searchKeys={['nombre', 'apellido', 'dni_cedula', 'email', 'ciudad']}
        searchPlaceholder="Buscar por nombre, apellido, cedula, email o ciudad..."
        onCreate={handleCreate}
        createLabel="Nuevo Dueno"
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay duenos registrados"
      />

      {/* Create Modal */}
      <CrudModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nuevo Dueno"
        description="Ingresa los datos del nuevo dueno de mascota."
        onSubmit={handleSubmitCreate}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <FormFields formData={formData} setFormData={setFormData} />
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Dueno"
        description="Modifica los datos del dueno."
        onSubmit={handleSubmitEdit}
        submitLabel="Actualizar"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <FormFields formData={formData} setFormData={setFormData} />
      </CrudModal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar Dueno"
        description={`Esta seguro de eliminar al dueno ${selectedDueno?.nombre} ${selectedDueno?.apellido}? Esta accion no se puede deshacer y puede afectar a las mascotas asociadas.`}
        onConfirm={handleConfirmDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
}