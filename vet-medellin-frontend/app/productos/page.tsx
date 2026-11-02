'use client';

import { useProductos } from '@/hooks/api/use-api'; // Verifica que la ruta hacia tu use-api.tsx sea correcta
import { DataGrid, type Column } from '@/components/data-grid/data-grid';

export default function ProductosPage() {
  // Consumimos los datos reales desde tu backend PHP usando el hook
  const { data: productos, isLoading } = useProductos();

  // Definimos las columnas adaptadas a las propiedades reales de tu productos.php
  const columns: Column<any>[] = [
    { 
      key: 'id', 
      label: 'ID' 
    },
    { 
      key: 'nombre', 
      label: 'Nombre del Producto' 
    },
    { 
      key: 'descripcion', 
      label: 'Descripción' 
    },
    { 
      key: 'categoria', 
      label: 'Categoría',
      render: (row: any) => {
        const cat = row.categoria || 'General';
        return <span className="capitalize">{cat}</span>;
      }
    },
    { 
      key: 'precio_venta', 
      label: 'Precio de Venta',
      render: (row: any) => {
        // Convertimos a número de forma segura por si viene de la BD como String
        const valor = parseFloat(row.precio_venta) || 0;
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(valor);
      }
    },
    { 
      key: 'stock_actual', 
      label: 'Stock Disponible',
      render: (row: any) => {
        const cantidad = parseInt(row.stock_actual) || 0;
        if (cantidad === 0) {
          return <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md text-xs">Agotado</span>;
        }
        if (cantidad <= 5) {
          return <span className="text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md text-xs">{cantidad} (Bajo Stock)</span>;
        }
        return <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md text-xs">{cantidad} unidades</span>;
      }
    }
  ];

  // Funciones de control vacías para evitar errores de modales o formularios rotos
  const handleEdit = (item: any) => console.log('Modo lectura activo', item);
  const handleDelete = (item: any) => console.log('Modo lectura activo', item);
  const handleView = (item: any) => console.log('Modo lectura activo', item);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Encabezado con el mismo formato limpio */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Inventario de Productos
        </h1>
        <p className="text-sm text-gray-500">
          Visualización en tiempo real de medicamentos, alimentos y accesorios en el sistema.
        </p>
      </div>

      {/* Contenedor del DataGrid idéntico al módulo de facturas */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400 font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Cargando base de datos de productos...
          </div>
        ) : (
          <DataGrid
            data={productos || []}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}
      </div>
    </div>
  );
}