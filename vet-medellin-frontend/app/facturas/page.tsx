"use client";

import { useState } from "react";
import { DataGrid, type Column } from "@/components/data-grid/data-grid";
import { CrudModal, type FormField } from "@/components/modals/crud-modal";
import { Button } from "@/components/ui/button";
import { useFacturas, useDuenos, useMascotas } from "@/hooks/api/use-api";
import { useToast as useAppToast } from "@/context/toast-context";
import { ShimmerLoader } from "@/components/custom/shimmer-loader";

export default function FacturasPage() {
  const { data: facturasData, isLoading, create, update, remove, mutate } = useFacturas();
  const { data: duenosData } = useDuenos();
  const { data: mascotasData } = useMascotas();
  
  // ESCUDO ANTI-PANTALLA BLANCA: Aseguramos que siempre sean arrays.
  // Si PHP envía un objeto de error, lo convertimos en un array vacío para que no explote React.
  const facturas = Array.isArray(facturasData) ? facturasData : [];
  const duenos = Array.isArray(duenosData) ? duenosData : [];
  const mascotas = Array.isArray(mascotasData) ? mascotasData : [];

  const toastContext: any = useAppToast();
  const showToast = toastContext?.showToast || console.log;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedFactura, setSelectedFactura] = useState<any>(null);

  const columns: Column<any>[] = [
    { 
      key: "id", // CORREGIDO: En tu BD se llama 'id', no 'id_factura'
      label: "ID Factura" 
    },
    { 
      key: "dueno_id", 
      label: "Propietario",
      render: (row: any) => {
        const duenoEncontrado = duenos.find((d: any) => String(d.id || d.dueno_id) === String(row.dueno_id));
        return duenoEncontrado 
          ? `${duenoEncontrado.nombre} ${duenoEncontrado.apellido || ""}`.trim() 
          : "No asignado";
      }
    },
    { 
      key: "mascota_nombre", 
      label: "Mascota",
      render: (row: any) => {
        const mascotaEncontrada = mascotas.find((m: any) => String(m.dueno_id || m.id_propietario) === String(row.dueno_id));
        return mascotaEncontrada ? mascotaEncontrada.nombre : "Sin mascota";
      }
    },
    { 
      key: "fecha_emision", 
      label: "Fecha",
      render: (row: any) => {
        if (!row.fecha_emision) return "Sin fecha";
        return new Date(row.fecha_emision).toLocaleDateString("es-CO");
      }
    },
    { 
      key: "total", 
      label: "Total",
      render: (row: any) => {
        const valor = parseFloat(row.total) || 0;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);
      }
    },
    { 
      key: "estado_pago", // CORREGIDO: En tu BD se llama 'estado_pago', no 'estado'
      label: "Estado",
      render: (row: any) => {
        const estado = row.estado_pago || "Desconocido";
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${estado === "Pagada" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {estado}
          </span>
        );
      }
    }
  ];

  const formFields: FormField[] = [
    { 
      name: "dueno_id", 
      label: "Propietario", 
      type: "select", 
      required: true, 
      options: duenos.map((d: any) => ({
        value: String(d.id || d.dueno_id),
        label: `${d.nombre || "Desconocido"} ${d.apellido || ""}`.trim()
      })).filter((opt: any) => opt.value !== "undefined")
    },
    { 
      name: "fecha_emision", 
      label: "Fecha de Emisión", 
      type: "date", 
      required: true 
    },
    // Añadí Subtotal, Impuestos y Método de pago porque tu SQL los exige para guardar bien la factura
    { 
      name: "subtotal", 
      label: "Subtotal ($)", 
      type: "number", 
      required: true 
    },
    { 
      name: "impuestos", 
      label: "Impuestos ($)", 
      type: "number", 
      required: true 
    },
    { 
      name: "total", 
      label: "Total ($)", 
      type: "number", 
      required: true 
    },
    { 
      name: "estado_pago", 
      label: "Estado de Pago", 
      type: "select", 
      required: true, 
      options: [
        { value: "Pagada", label: "Pagada" }, 
        { value: "Pendiente", label: "Pendiente" }
      ] 
    },
    { 
      name: "metodo_pago", 
      label: "Método de Pago", 
      type: "select", 
      required: true, 
      options: [
        { value: "Efectivo", label: "Efectivo" }, 
        { value: "Tarjeta", label: "Tarjeta" },
        { value: "Transferencia", label: "Transferencia" }
      ] 
    }
  ];

  const formatInputDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleCreate = () => { 
    setSelectedFactura(null); 
    setModalMode("create"); 
    setModalOpen(true); 
  };

  const handleEdit = (f: any) => { 
    setSelectedFactura({
      ...f,
      fecha_emision: formatInputDate(f.fecha_emision)
    }); 
    setModalMode("edit"); 
    setModalOpen(true); 
  };

  const handleView = (f: any) => { 
    setSelectedFactura({
      ...f,
      fecha_emision: formatInputDate(f.fecha_emision)
    }); 
    setModalMode("view"); 
    setModalOpen(true); 
  };
  
  const handleDelete = async (f: any) => {
    try {
      await remove(f.id); // CORREGIDO: Usa el f.id nativo
      showToast("Factura eliminada correctamente", "success");
      mutate();
    } catch (error) {
      showToast("Error al eliminar la factura", "error");
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (modalMode === "create") {
        await create(data);
        showToast("Factura creada correctamente", "success");
      } else {
        await update(selectedFactura.id, data); // CORREGIDO: Usa selectedFactura.id
        showToast("Factura actualizada correctamente", "success");
      }
      setModalOpen(false);
      mutate();
    } catch (error) {
      showToast("Error al procesar la factura", "error");
    }
  };

  if (isLoading) return <ShimmerLoader text="Cargando facturas..." />;

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Facturación</h1>
            <p className="text-sm text-gray-500">Gestión de cobros y pagos</p>
          </div>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">Nueva Factura</Button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <DataGrid 
            data={facturas} 
            columns={columns} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onView={handleView} 
          />
        </div>
        
        <CrudModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          mode={modalMode} 
          title="Factura" 
          fields={formFields} 
          data={selectedFactura} 
          onSubmit={handleSubmit} 
        />
    </div>
  );
}