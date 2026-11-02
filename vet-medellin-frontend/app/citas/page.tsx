'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DataGrid, type Column } from '@/components/data-grid/data-grid';
import { CrudModal, DeleteConfirmModal, ViewModal } from '@/components/modals/crud-modal';
import { AppointmentCalendar } from '@/components/calendar/appointment-calendar';
import { useCitas, useMascotas, useMedicos } from '@/hooks/api/use-api';
import { useToast } from '@/context/toast-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ESTADOS_CITA } from '@/lib/constants';
import type { Cita, CitaFormData } from '@/lib/types';

export default function CitasPage() {
  const { data: citas, isLoading, create, update, remove } = useCitas();
  const { data: mascotas } = useMascotas();
  const { data: medicos } = useMedicos();
  const { showToast } = useToast();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View toggle
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Form state
  const [formData, setFormData] = useState<CitaFormData>({
    mascota_id: 0,
    medico_id: 0,
    fecha_hora: '',
    motivo: '',
    estado: 'Programada',
  });

  const columns: Column<Cita>[] = [
    {
      key: 'fecha_hora',
      label: 'Fecha y Hora',
      sortable: true,
      render: (cita) => {
        const fecha = parseISO(cita.fecha_hora);
        return (
          <div>
            <p className="font-medium">{format(fecha, "d 'de' MMM, yyyy", { locale: es })}</p>
            <p className="text-sm text-gray-500">{format(fecha, 'HH:mm')}</p>
          </div>
        );
      },
    },
    { key: 'mascota_nombre', label: 'Mascota', sortable: true },
    {
      key: 'medico_nombre',
      label: 'Medico',
      sortable: true,
      render: (cita) => `Dr. ${cita.medico_nombre} ${cita.medico_apellido}`,
    },
    { key: 'dueno_nombre', label: 'Dueno' },
    { key: 'motivo', label: 'Motivo' },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (cita) => {
        const statusConfig = ESTADOS_CITA.find((s) => s.value === cita.estado);
        return (
          <Badge className={statusConfig?.color || ''}>
            {cita.estado}
          </Badge>
        );
      },
    },
  ];

  const resetForm = (presetDate?: Date) => {
    setFormData({
      mascota_id: 0,
      medico_id: 0,
      fecha_hora: presetDate ? format(presetDate, "yyyy-MM-dd'T'HH:mm") : '',
      motivo: '',
      estado: 'Programada',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleCreateFromCalendar = (date: Date) => {
    resetForm(date);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (cita: Cita) => {
    setSelectedCita(cita);
    setFormData({
      mascota_id: cita.mascota_id,
      medico_id: cita.medico_id,
      fecha_hora: cita.fecha_hora.replace(' ', 'T').slice(0, 16),
      motivo: cita.motivo || '',
      estado: cita.estado,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (cita: Cita) => {
    setSelectedCita(cita);
    setIsDeleteModalOpen(true);
  };

  const handleView = (cita: Cita) => {
    setSelectedCita(cita);
    setIsViewModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.mascota_id || !formData.medico_id || !formData.fecha_hora) {
      showToast('Mascota, medico y fecha son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await create(formData);
      showToast('Cita agendada correctamente', 'success');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al agendar la cita. Puede haber un choque de horarios.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedCita) return;
    if (!formData.mascota_id || !formData.medico_id || !formData.fecha_hora) {
      showToast('Mascota, medico y fecha son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await update(selectedCita.id, formData);
      showToast('Cita actualizada correctamente', 'success');
      setIsEditModalOpen(false);
      setSelectedCita(null);
    } catch (error) {
      showToast('Error al actualizar la cita', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCita) return;

    setIsSubmitting(true);
    try {
      await remove(selectedCita.id);
      showToast('Cita cancelada correctamente', 'success');
      setIsDeleteModalOpen(false);
      setSelectedCita(null);
    } catch (error) {
      showToast('Error al cancelar la cita', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mascota_id">Mascota *</Label>
        <Select
          value={formData.mascota_id ? String(formData.mascota_id) : ''}
          onValueChange={(value) => setFormData({ ...formData, mascota_id: Number(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar mascota" />
          </SelectTrigger>
          <SelectContent>
            {mascotas.filter(m => m.activo).map((mascota) => (
              <SelectItem key={mascota.id} value={String(mascota.id)}>
                {mascota.nombre} ({mascota.especie}) - {mascota.dueno_nombre} {mascota.dueno_apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Solo mascotas activas son mostradas</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medico_id">Medico *</Label>
        <Select
          value={formData.medico_id ? String(formData.medico_id) : ''}
          onValueChange={(value) => setFormData({ ...formData, medico_id: Number(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar medico" />
          </SelectTrigger>
          <SelectContent>
            {medicos.filter(m => m.activo).map((medico) => (
              <SelectItem key={medico.id} value={String(medico.id)}>
                Dr. {medico.nombre} {medico.apellido} - {medico.especialidad || 'General'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Solo medicos activos son mostrados</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha_hora">Fecha y Hora *</Label>
        <Input
          id="fecha_hora"
          type="datetime-local"
          value={formData.fecha_hora}
          onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo de la consulta</Label>
        <Textarea
          id="motivo"
          placeholder="Describir el motivo de la cita..."
          value={formData.motivo || ''}
          onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
          rows={3}
        />
      </div>

      {selectedCita && (
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={formData.estado}
            onValueChange={(value) => setFormData({ ...formData, estado: value as Cita['estado'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_CITA.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  {estado.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Citas</h1>
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Tabla
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendario
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <DataGrid
          data={citas}
          columns={columns}
          isLoading={isLoading}
          searchKeys={['mascota_nombre', 'medico_nombre', 'dueno_nombre', 'motivo']}
          searchPlaceholder="Buscar por mascota, medico, dueno o motivo..."
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          emptyMessage="No hay citas registradas"
        />
      ) : (
        <AppointmentCalendar
          citas={citas}
          onSelectCita={handleView}
          onSelectDate={handleCreateFromCalendar}
        />
      )}

      {/* Create Modal */}
      <CrudModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nueva Cita"
        description="Agenda una nueva cita para una mascota."
        onSubmit={handleSubmitCreate}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <FormFields />
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Cita"
        description="Modifica los datos de la cita."
        onSubmit={handleSubmitEdit}
        submitLabel="Actualizar"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <FormFields />
      </CrudModal>

      {/* View Modal */}
      <ViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        title="Detalles de la Cita"
        size="lg"
      >
        {selectedCita && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={ESTADOS_CITA.find((s) => s.value === selectedCita.estado)?.color || ''}>
                {selectedCita.estado}
              </Badge>
              <p className="text-sm text-gray-500">ID: {selectedCita.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha y Hora</p>
                <p className="font-medium">
                  {format(parseISO(selectedCita.fecha_hora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  <br />
                  {format(parseISO(selectedCita.fecha_hora), 'HH:mm')} hrs
                </p>
              </div>
              <div>
                <p className="text-gray-500">Mascota</p>
                <p className="font-medium">{selectedCita.mascota_nombre}</p>
              </div>
              <div>
                <p className="text-gray-500">Medico</p>
                <p className="font-medium">Dr. {selectedCita.medico_nombre} {selectedCita.medico_apellido}</p>
              </div>
              <div>
                <p className="text-gray-500">Dueno</p>
                <p className="font-medium">{selectedCita.dueno_nombre}</p>
              </div>
            </div>
            {selectedCita.motivo && (
              <div>
                <p className="text-gray-500 text-sm">Motivo</p>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedCita.motivo}</p>
              </div>
            )}
            <div className="pt-4 border-t flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedCita);
                }}
              >
                Editar Cita
              </Button>
              {selectedCita.estado !== 'Atendida' && selectedCita.estado !== 'Cancelada' && (
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleDelete(selectedCita);
                  }}
                >
                  Cancelar Cita
                </Button>
              )}
            </div>
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Cancelar Cita"
        description={`Esta seguro de cancelar la cita de ${selectedCita?.mascota_nombre} programada para el ${selectedCita ? format(parseISO(selectedCita.fecha_hora), "d 'de' MMMM", { locale: es }) : ''}?`}
        onConfirm={handleConfirmDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
