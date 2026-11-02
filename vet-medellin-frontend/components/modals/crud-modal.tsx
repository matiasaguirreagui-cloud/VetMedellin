'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  required?: boolean;
  options?: { value: string | number | boolean; label: string }[];
}

interface CrudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Para Historias (Modo clásico)
  children?: ReactNode;
  
  // Para Facturas / Médicos (Modo dinámico)
  mode?: 'create' | 'edit' | 'view';
  fields?: FormField[];
  data?: any;
  onSubmit?: (data?: any) => void;
}

export function CrudModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Guardar',
  isSubmitting = false,
  size = 'md',
  children,
  mode = 'create',
  fields,
  data,
  onSubmit
}: CrudModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  useEffect(() => {
    if (open && data && mode !== 'create') {
      setFormData(data);
    } else if (open && mode === 'create') {
      const initialData: Record<string, any> = {};
      fields?.forEach(f => {
        if (f.type === 'boolean') initialData[f.name] = true;
      });
      setFormData(initialData);
    }
  }, [open, data, mode, fields]);

  const handleChange = (name: string, value: any) => {
    // Si el valor viene de un select y es numérico, lo convertimos para evitar romper la igualdad estricta
    const isNumeric = typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value));
    const finalValue = isNumeric ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleDynamicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  // MODO 1: Si viene de "Historias" (tiene children)
  if (children) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={sizeClasses[size]}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={() => onSubmit && onSubmit(formData)} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? 'Guardando...' : submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // MODO 2: Si viene de "Facturas" o "Médicos" (tiene fields)
  const isReadOnly = mode === 'view';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? `Crear ${title}` : mode === 'edit' ? `Editar ${title}` : `Ver ${title}`}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleDynamicSubmit} className="py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {fields?.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
                  <span>
                    {field.label} {field.required && !isReadOnly && <span className="text-red-500">*</span>}
                  </span>
                </label>
                
                {field.type === 'select' ? (
                  <select 
                    disabled={isReadOnly} 
                    required={field.required} 
                    value={formData[field.name] ?? ''} 
                    onChange={(e) => handleChange(field.name, e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>Seleccione una opción</option>
                    {field.options?.map((opt, idx) => {
                      const safeKey = opt.value !== undefined && opt.value !== null ? String(opt.value) : `opt-${field.name}-${idx}`;
                      const safeValue = opt.value !== undefined && opt.value !== null ? String(opt.value) : '';
                      return (
                        <option key={safeKey} value={safeValue}>
                          {opt.label}
                        </option>
                      );
                    })}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea 
                    disabled={isReadOnly} 
                    required={field.required} 
                    value={formData[field.name] || ''} 
                    onChange={(e) => handleChange(field.name, e.target.value)} 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  />
                ) : field.type === 'boolean' ? (
                  <div className="flex items-center justify-between p-2 rounded-md border bg-gray-50/50">
                    <span className="text-xs text-gray-500">{formData[field.name] ? 'Activo / Habilitado' : 'Inactivo / Deshabilitado'}</span>
                    <Switch 
                      disabled={isReadOnly}
                      checked={!!formData[field.name]} 
                      onCheckedChange={(checked) => handleChange(field.name, checked)} 
                    />
                  </div>
                ) : (
                  <input 
                    type={field.type} 
                    disabled={isReadOnly} 
                    required={field.required} 
                    value={formData[field.name] || ''} 
                    onChange={(e) => handleChange(field.name, field.type === 'text' && field.name === 'tarjeta_profesional' ? e.target.value.toUpperCase() : e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? 'Guardando...' : submitLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title = 'Confirmar eliminación',
  description = 'Esta acción no se puede deshacer. El registro será eliminado permanentemente.',
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ViewModal({
  open,
  onOpenChange,
  title,
  children,
  size = 'md',
}: ViewModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}