'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistorias, useMascotas, useMedicos } from '@/hooks/api/use-api';
import { CrudModal, ViewModal } from '@/components/modals/crud-modal';
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
import { ShimmerLoader } from '@/components/custom/shimmer-loader';
import type { HistoriaFormState } from '@/lib/types';

export default function HistoriasPage() {
  const searchParams = useSearchParams();
  const initialMascotaId = searchParams.get('mascota');

  const { data: historias = [], isLoading, create, update } = useHistorias();
  const { data: mascotas = [] } = useMascotas();
  const { data: medicos = [] } = useMedicos();
  const { showToast } = useToast();

  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(
    initialMascotaId ? Number(initialMascotaId) : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedHistoria, setSelectedHistoria] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState: HistoriaFormState = {
    mascota_id: selectedMascotaId || 0,
    medico_id: 0,
    cita_id: null,
    fecha_consulta: new Date().toISOString().split('T')[0],
    motivo_consulta: '',
    sintomas: '',
    examen_fisico: '',
    diagnostico: '',
    plan_tratamiento: '',
    proxima_revision: null,
    peso: '',
    temperatura: '',
    frecuencia_cardiaca: '',
    frecuencia_respiratoria: '',
  };

  const [formData, setFormData] = useState<HistoriaFormState>(initialFormState);

  const filteredHistorias = useMemo(() => {
    let result = historias;
    if (selectedMascotaId) {
      result = result.filter((h: any) => h.mascota_id === selectedMascotaId);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (h: any) =>
          h.mascota_nombre?.toLowerCase().includes(query) ||
          h.diagnostico?.toLowerCase().includes(query) ||
          h.motivo_consulta?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [historias, selectedMascotaId, searchQuery]);

  const selectedMascota = mascotas.find((m: any) => m.id === selectedMascotaId);

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      mascota_id: selectedMascotaId || 0,
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (historia: any) => {
    setSelectedHistoria(historia);
    setFormData({
      mascota_id: historia.mascota_id,
      medico_id: historia.medico_id,
      cita_id: historia.cita_id || null,
      fecha_consulta: historia.fecha ? historia.fecha.split('T')[0] : (historia.fecha_consulta ? historia.fecha_consulta.split('T')[0] : new Date().toISOString().split('T')[0]),
      motivo_consulta: historia.motivo_consulta || '',
      sintomas: historia.sintomas || '',
      examen_fisico: historia.examen_physico || historia.examen_fisico || '',
      diagnostico: historia.diagnostico || '',
      plan_tratamiento: historia.tratamiento || historia.plan_tratamiento || '',
      proxima_revision: historia.proxima_revision || null,
      peso: historia.peso !== null && historia.peso !== undefined && historia.peso !== "" ? Number(historia.peso) : '',
      temperatura: historia.temperatura !== null && historia.temperatura !== undefined && historia.temperatura !== "" ? Number(historia.temperatura) : '',
      frecuencia_cardiaca: historia.frecuencia_cardiaca !== null && historia.frecuencia_cardiaca !== undefined && historia.frecuencia_cardiaca !== "" ? Number(historia.frecuencia_cardiaca) : '',
      frecuencia_respiratoria: historia.frecuencia_respiratoria !== null && historia.frecuencia_respiratoria !== undefined && historia.frecuencia_respiratoria !== "" ? Number(historia.frecuencia_respiratoria) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleView = (historia: any) => {
    setSelectedHistoria(historia);
    setIsViewModalOpen(true);
  };

  const prepareDataForSubmit = (state: HistoriaFormState) => {
    return {
      mascota_id: Number(state.mascota_id),
      medico_id: Number(state.medico_id),
      fecha: state.fecha_consulta,
      motivo_consulta: state.motivo_consulta || '',
      sintomas: state.sintomas || '',
      examen_physico: state.examen_fisico || '', 
      peso: state.peso === '' ? null : Number(state.peso),
      temperatura: state.temperatura === '' ? null : Number(state.temperatura),
      frecuencia_cardiaca: state.frecuencia_cardiaca === '' ? null : Number(state.frecuencia_cardiaca),
      frecuencia_respiratoria: state.frecuencia_respiratoria === '' ? null : Number(state.frecuencia_respiratoria),
      diagnostico: state.diagnostico || '',
      tratamiento: state.plan_tratamiento || '',
    };
  };

  const handleSubmitCreate = async () => {
    if (!formData.mascota_id || !formData.medico_id) {
      showToast('Mascota y médico son obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = prepareDataForSubmit(formData);
      await create(dataToSend as any);
      showToast('Registro creado correctamente', 'success');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al crear el registro', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedHistoria) return;

    setIsSubmitting(true);
    try {
      const dataToSend = prepareDataForSubmit(formData);
      await update(selectedHistoria.id, dataToSend as any);
      showToast('Registro actualizado correctamente', 'success');
      setIsEditModalOpen(false);
      setSelectedHistoria(null);
    } catch (error) {
      showToast('Error al actualizar el registro', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
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
              {mascotas.map((mascota: any) => (
                <SelectItem key={mascota.id} value={String(mascota.id)}>
                  {mascota.nombre} - {mascota.dueno_nombre || ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="medico_id">Médico *</Label>
          <Select
            value={formData.medico_id ? String(formData.medico_id) : ''}
            onValueChange={(value) => setFormData({ ...formData, medico_id: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar médico" />
            </SelectTrigger>
            <SelectContent>
              {medicos.map((medico: any) => (
                <SelectItem key={medico.id} value={String(medico.id)}>
                  Dr. {medico.nombre} {medico.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha_consulta">Fecha de Consulta *</Label>
        <Input
          id="fecha_consulta"
          type="date"
          value={formData.fecha_consulta}
          onChange={(e) => setFormData({ ...formData, fecha_consulta: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo_consulta">Motivo de consulta</Label>
        <Textarea
          id="motivo_consulta"
          placeholder="Motivo de la visita..."
          value={formData.motivo_consulta}
          onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sintomas">Síntomas</Label>
        <Textarea
          id="sintomas"
          placeholder="Síntomas observados..."
          value={formData.sintomas}
          onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="examen_physico">Examen Físico</Label>
        <Textarea
          id="examen_physico"
          placeholder="Detalles del examen físico..."
          value={formData.examen_fisico}
          onChange={(e) => setFormData({ ...formData, examen_fisico: e.target.value })}
          rows={2}
        />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <p className="text-sm font-medium text-gray-700">Signos Vitales</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input
              id="peso"
              type="text"
              placeholder="12.5"
              value={formData.peso}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, peso: val === "" ? "" : Number(val) });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperatura">Temperatura (°C)</Label>
            <Input
              id="temperatura"
              type="text"
              placeholder="38.5"
              value={formData.temperatura}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, temperatura: val === "" ? "" : Number(val) });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frecuencia_cardiaca">Frec. Cardíaca (bpm)</Label>
            <Input
              id="frecuencia_cardiaca"
              type="text"
              placeholder="80"
              value={formData.frecuencia_cardiaca}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, frecuencia_cardiaca: val === "" ? "" : Number(val) });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frecuencia_respiratoria">Frec. Respiratoria (rpm)</Label>
            <Input
              id="frecuencia_respiratoria"
              type="text"
              placeholder="20"
              value={formData.frecuencia_respiratoria}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, frecuencia_respiratoria: val === "" ? "" : Number(val) });
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnostico">Diagnóstico</Label>
        <Textarea
          id="diagnostico"
          placeholder="Diagnóstico del médico..."
          value={formData.diagnostico}
          onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan_tratamiento">Plan de Tratamiento</Label>
        <Textarea
          id="plan_tratamiento"
          placeholder="Tratamiento prescrito..."
          value={formData.plan_tratamiento}
          onChange={(e) => setFormData({ ...formData, plan_tratamiento: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Historias Clínicas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {selectedMascota
              ? `Mostrando registros de ${selectedMascota.nombre}`
              : 'Todos los registros médicos'}
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Registro
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          value={selectedMascotaId ? String(selectedMascotaId) : 'all'}
          onValueChange={(value) => setSelectedMascotaId(value === 'all' ? null : Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por mascota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las mascotas</SelectItem>
            {mascotas.map((mascota: any) => (
              <SelectItem key={mascota.id} value={String(mascota.id)}>
                {mascota.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="md:col-span-2">
          <Input
            placeholder="Buscar por diagnóstico, motivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Pet Summary Card */}
      {selectedMascota && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900">{selectedMascota.nombre}</h3>
              <p className="text-sm text-emerald-700">{selectedMascota.especie} - {selectedMascota.raza}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-800">{filteredHistorias.length}</p>
              <p className="text-sm text-emerald-600">registros</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline View */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <ShimmerLoader key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredHistorias.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No hay registros de historias clínicas</p>
          <Button onClick={handleCreate} className="mt-4" variant="outline">
            Crear primer registro
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />

          <AnimatePresence>
            {filteredHistorias.map((historia: any, index) => (
              <motion.div
                key={historia.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-12 pb-6"
              >
                <div className="absolute left-3 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow" />

                <div
                  className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleView(historia)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        {historia.fecha ? format(parseISO(historia.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : (historia.fecha_consulta ? format(parseISO(historia.fecha_consulta), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : 'Sin fecha')}
                      </p>
                      <p className="font-medium text-gray-800">
                        {!selectedMascotaId && <span className="text-emerald-600">{historia.mascota_nombre} - </span>}
                        Dr. {historia.medico_nombre} {historia.medico_apellido}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      #{historia.id}
                    </Badge>
                  </div>

                  {historia.diagnostico && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Diagnóstico</p>
                      <p className="text-gray-700">{historia.diagnostico}</p>
                    </div>
                  )}

                  {(historia.peso || historia.temperatura || historia.frecuencia_cardiaca) && (
                    <div className="flex gap-4 text-sm bg-gray-50 p-2 rounded-md inline-flex">
                      {historia.peso && (
                        <span className="text-gray-500">
                          Peso: <strong className="text-gray-700">{historia.peso}</strong> kg
                        </span>
                      )}
                      {historia.temperatura && (
                        <span className="text-gray-500">
                          Temp: <strong className="text-gray-700">{historia.temperatura}</strong> °C
                        </span>
                      )}
                      {historia.frecuencia_cardiaca && (
                        <span className="text-gray-500">
                          FC: <strong className="text-gray-700">{historia.frecuencia_cardiaca}</strong> bpm
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(historia);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(historia);
                      }}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <CrudModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nuevo Registro Clínico"
        description="Registra una nueva consulta o procedimiento médico."
        onSubmit={handleSubmitCreate}
        isSubmitting={isSubmitting}
        size="lg"
      >
        {renderFormFields()}
      </CrudModal>

      {/* Edit Modal */}
      <CrudModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Registro"
        description="Modifica el registro clínico."
        onSubmit={handleSubmitEdit}
        submitLabel="Actualizar"
        isSubmitting={isSubmitting}
        size="lg"
      >
        {renderFormFields()}
      </CrudModal>

      {/* View Modal */}
      <ViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        title="Detalle del Registro"
        size="lg"
      >
        {selectedHistoria && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedHistoria.fecha ? format(parseISO(selectedHistoria.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : (selectedHistoria.fecha_consulta ? format(parseISO(selectedHistoria.fecha_consulta), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : 'Sin fecha')}
                </p>
                <p className="font-medium">
                  {selectedHistoria.mascota_nombre} - Dr. {selectedHistoria.medico_nombre} {selectedHistoria.medico_apellido}
                </p>
              </div>
              <Badge variant="outline">#{selectedHistoria.id}</Badge>
            </div>

            {/* Vital Signs */}
            {(selectedHistoria.peso || selectedHistoria.temperatura || selectedHistoria.frecuencia_cardiaca || selectedHistoria.frecuencia_respiratoria) && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-emerald-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">{selectedHistoria.peso || '-'}</p>
                  <p className="text-xs text-emerald-600">Peso (kg)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">{selectedHistoria.temperatura || '-'}</p>
                  <p className="text-xs text-emerald-600">Temp (°C)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">{selectedHistoria.frecuencia_cardiaca || '-'}</p>
                  <p className="text-xs text-emerald-600">FC (bpm)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">{selectedHistoria.frecuencia_respiratoria || '-'}</p>
                  <p className="text-xs text-emerald-600">FR (rpm)</p>
                </div>
              </div>
            )}

            {selectedHistoria.motivo_consulta && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Motivo de consulta</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedHistoria.motivo_consulta}</p>
              </div>
            )}

            {selectedHistoria.sintomas && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Síntomas</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedHistoria.sintomas}</p>
              </div>
            )}

            {(selectedHistoria.examen_physico || selectedHistoria.examen_fisico) && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Examen Físico</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedHistoria.examen_physico || selectedHistoria.examen_fisico}</p>
              </div>
            )}

            {selectedHistoria.diagnostico && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Diagnóstico</p>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{selectedHistoria.diagnostico}</p>
              </div>
            )}

            {(selectedHistoria.tratamiento || selectedHistoria.plan_tratamiento) && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Plan de Tratamiento</p>
                <p className="text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100">{selectedHistoria.tratamiento || selectedHistoria.plan_tratamiento}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedHistoria);
                }}
              >
                Editar Registro
              </Button>
            </div>
          </div>
        )}
      </ViewModal>
    </div>
  );
}