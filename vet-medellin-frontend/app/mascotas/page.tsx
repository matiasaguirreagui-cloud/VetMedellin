'use client';

import { useState } from 'react';
import { DataGrid, type Column } from '@/components/data-grid/data-grid';
import { CrudModal, DeleteConfirmModal, ViewModal } from '@/components/modals/crud-modal';
import { useMascotas, useDuenos } from '@/hooks/api/use-api';
import { useToast } from '@/context/toast-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ESPECIES, SEXOS } from '@/lib/constants';
import type { Mascota, MascotaFormData } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MascotasPage() {
  const { data: mascotas, isLoading, create, update, remove } = useMascotas();
  const { data: duenos, isLoading: isLoadingDuenos } = useDuenos();
  const { showToast } = useToast();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<MascotaFormData>({
    nombre: '',
    especie: 'Canino',
    raza: '',
    dueno_id: 0,
    fecha_nacimiento: null,
    sexo: null,
    color: null,
    microchip: null,
    peso_actual: null,
    esterilizado: false,
    foto_url: null,
    activo: true,
  });

  // Helper para buscar los datos reales del dueño cargado en memoria
  const getDuenoName = (duenoId: number) => {
    if (!duenos) return null;
    const dueno = duenos.find((d: any) => Number(d.id) === Number(duenoId));
    return dueno ? `${dueno.nombre} ${dueno.apellido}` : null;
  };

  const columns: Column<Mascota>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    {
      key: 'especie',
      label: 'Especie',
      sortable: true,
      render: (mascota) => (
        <Badge variant="outline" className="font-normal">
          {mascota.especie}
        </Badge>
      ),
    },
    { key: 'raza', label: 'Raza', sortable: true },
    {
      key: 'dueno_id',
      label: 'Dueño',
      sortable: true,
      render: (mascota) => {
        const nombreDueno = getDuenoName(mascota.dueno_id) || (mascota.dueno_nombre ? `${mascota.dueno_nombre} ${mascota.dueno_apellido || ''}` : null);
        return nombreDueno ? (
          <span>{nombreDueno}</span>
        ) : (
          <span className="text-gray-400 font-normal italic">Sin asignar</span>
        );
      },
    },
    {
      key: 'peso_actual',
      label: 'Peso (kg)',
      render: (mascota) => mascota.peso_actual ? `${mascota.peso_actual} kg` : '-',
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (mascota) => (
        <Badge 
          variant={mascota.activo ? 'default' : 'secondary'} 
          className={mascota.activo ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none' : ''}
        >
          {mascota.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  const resetForm = () => {
    setFormData({
      nombre: '',
      especie: 'Canino',
      raza: '',
      dueno_id: 0,
      fecha_nacimiento: null,
      sexo: null,
      color: null,
      microchip: null,
      peso_actual: null,
      esterilizado: false,
      foto_url: null,
      activo: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setFormData({
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      dueno_id: mascota.dueno_id,
      fecha_nacimiento: mascota.fecha_nacimiento,
      sexo: mascota.sexo,
      color: mascota.color,
      microchip: mascota.microchip,
      peso_actual: mascota.peso_actual,
      esterilizado: mascota.esterilizado,
      foto_url: mascota.foto_url,
      activo: mascota.activo,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setIsDeleteModalOpen(true);
  };

  const handleView = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setIsViewModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.nombre || !formData.raza || !formData.dueno_id) {
      showToast('Nombre, raza y dueño son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await create(formData);
      showToast('Mascota creada correctamente', 'success');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al crear la mascota', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedMascota) return;
    if (!formData.nombre || !formData.raza || !formData.dueno_id) {
      showToast('Nombre, raza y dueño son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await update(selectedMascota.id, formData);
      showToast('Mascota actualizada correctamente', 'success');
      setIsEditModalOpen(false);
      setSelectedMascota(null);
    } catch (error) {
      showToast('Error al actualizar la mascota', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMascota) return;

    setIsSubmitting(true);
    try {
      await remove(selectedMascota.id);
      showToast('Mascota eliminada correctamente', 'success');
      setIsDeleteModalOpen(false);
      setSelectedMascota(null);
    } catch (error) {
      showToast('Error al eliminar la mascota', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DataGrid
        title="Mascotas"
        data={mascotas || []}
        columns={columns}
        isLoading={isLoading || isLoadingDuenos}
        searchKeys={['nombre', 'raza', 'especie']}
        searchPlaceholder="Buscar por nombre, raza o especie..."
        onCreate={handleCreate}
        createLabel="Nueva Mascota"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        emptyMessage="No hay mascotas registradas"
      />

      {/* Create Modal */}
      <CrudModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nueva Mascota"
        description="Ingresa los datos de la nueva mascota."
        onSubmit={handleSubmitCreate}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-nombre">Nombre *</Label>
              <Input
                id="create-nombre"
                placeholder="Max"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-dueno_id">Dueño *</Label>
              <Select
                value={formData.dueno_id ? String(formData.dueno_id) : ''}
                onValueChange={(value) => setFormData({ ...formData, dueno_id: Number(value) })}
              >
                <SelectTrigger id="create-dueno_id">
                  <SelectValue placeholder="Seleccionar dueño" />
                </SelectTrigger>
                <SelectContent>
                  {duenos?.map((dueno) => (
                    <SelectItem key={dueno.id} value={String(dueno.id)}>
                      {dueno.nombre} {dueno.apellido} - {dueno.dni_cedula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-especie">Especie *</Label>
              <Select
                value={formData.especie}
                onValueChange={(value) => setFormData({ ...formData, especie: value as Mascota['especie'] })}
              >
                <SelectTrigger id="create-especie">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIES.map((especie) => (
                    <SelectItem key={especie.value} value={especie.value}>
                      {especie.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-raza">Raza *</Label>
              <Input
                id="create-raza"
                placeholder="Border Collie"
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-sexo">Sexo</Label>
              <Select
                value={formData.sexo || ''}
                onValueChange={(value) => setFormData({ ...formData, sexo: value as Mascota['sexo'] })}
              >
                <SelectTrigger id="create-sexo">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {SEXOS.map((sexo) => (
                    <SelectItem key={sexo.value} value={sexo.value}>
                      {sexo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-color">Color</Label>
              <Input
                id="create-color"
                placeholder="Negro y blanco"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="create-fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento || ''}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-peso_actual">Peso (kg)</Label>
              <Input
                id="create-peso_actual"
                type="number"
                step="0.1"
                placeholder="12.5"
                value={formData.peso_actual || ''}
                onChange={(e) => setFormData({ ...formData, peso_actual: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-microchip">Microchip</Label>
              <Input
                id="create-microchip"
                placeholder="MC001234"
                value={formData.microchip || ''}
                onChange={(e) => setFormData({ ...formData, microchip: e.target.value || null })}
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50/50 mt-2 sm:mt-6">
              <Label htmlFor="create-esterilizado" className="cursor-pointer">Esterilizado</Label>
              <Switch
                id="create-esterilizado"
                checked={formData.esterilizado}
                onCheckedChange={(checked) => setFormData({ ...formData, esterilizado: checked })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50/50 py-2">
            <Label htmlFor="create-activo" className="cursor-pointer">Estado activo</Label>
            <Switch
              id="create-activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
          </div>
        </div>
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Mascota"
        description="Modifica los datos de la mascota."
        onSubmit={handleSubmitEdit}
        submitLabel="Actualizar"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre *</Label>
              <Input
                id="edit-nombre"
                placeholder="Max"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueno_id">Dueño *</Label>
              <Select
                value={formData.dueno_id ? String(formData.dueno_id) : ''}
                onValueChange={(value) => setFormData({ ...formData, dueno_id: Number(value) })}
              >
                <SelectTrigger id="edit-dueno_id">
                  <SelectValue placeholder="Seleccionar dueño" />
                </SelectTrigger>
                <SelectContent>
                  {duenos?.map((dueno) => (
                    <SelectItem key={dueno.id} value={String(dueno.id)}>
                      {dueno.nombre} {dueno.apellido} - {dueno.dni_cedula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-especie">Especie *</Label>
              <Select
                value={formData.especie}
                onValueChange={(value) => setFormData({ ...formData, especie: value as Mascota['especie'] })}
              >
                <SelectTrigger id="edit-especie">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIES.map((especie) => (
                    <SelectItem key={especie.value} value={especie.value}>
                      {especie.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-raza">Raza *</Label>
              <Input
                id="edit-raza"
                placeholder="Border Collie"
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sexo">Sexo</Label>
              <Select
                value={formData.sexo || ''}
                onValueChange={(value) => setFormData({ ...formData, sexo: value as Mascota['sexo'] })}
              >
                <SelectTrigger id="edit-sexo">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {SEXOS.map((sexo) => (
                    <SelectItem key={sexo.value} value={sexo.value}>
                      {sexo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                placeholder="Negro y blanco"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="edit-fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento || ''}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-peso_actual">Peso (kg)</Label>
              <Input
                id="edit-peso_actual"
                type="number"
                step="0.1"
                placeholder="12.5"
                value={formData.peso_actual || ''}
                onChange={(e) => setFormData({ ...formData, peso_actual: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-microchip">Microchip</Label>
              <Input
                id="edit-microchip"
                placeholder="MC001234"
                value={formData.microchip || ''}
                onChange={(e) => setFormData({ ...formData, microchip: e.target.value || null })}
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50/50 mt-2 sm:mt-6">
              <Label htmlFor="edit-esterilizado" className="cursor-pointer">Esterilizado</Label>
              <Switch
                id="edit-esterilizado"
                checked={formData.esterilizado}
                onCheckedChange={(checked) => setFormData({ ...formData, esterilizado: checked })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50/50 py-2">
            <Label htmlFor="edit-activo" className="cursor-pointer">Estado activo</Label>
            <Switch
              id="edit-activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
          </div>
        </div>
      </CrudModal>

      {/* View Modal */}
      <ViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        title={`Detalles de ${selectedMascota?.nombre}`}
        size="lg"
      >
        {selectedMascota && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.nombre}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Especie</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.especie}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Raza</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.raza}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Dueño</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">
                  {getDuenoName(selectedMascota.dueno_id) || (selectedMascota.dueno_nombre ? `${selectedMascota.dueno_nombre} ${selectedMascota.dueno_apellido || ''}` : 'Sin asignar')}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sexo</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.sexo || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Color</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.color || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Peso</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">
                  {selectedMascota.peso_actual ? `${selectedMascota.peso_actual} kg` : '-'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Microchip</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.microchip || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Esterilizado</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.esterilizado ? 'Sí' : 'No'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fecha de Nacimiento</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">{selectedMascota.fecha_nacimiento || '-'}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <Link href={`/historias?mascota=${selectedMascota.id}`}>
                <Button variant="outline" className="w-full justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ver Historia Clínica
                </Button>
              </Link>
            </div>
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar Mascota"
        description={`¿Está seguro de eliminar a ${selectedMascota?.nombre}? Esta acción no se puede deshacer y eliminará toda la historia clínica asociada.`}
        onConfirm={handleConfirmDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
}