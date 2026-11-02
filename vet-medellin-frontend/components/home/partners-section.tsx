'use client';

import { motion } from 'framer-motion';
import { useAlianzas } from '@/hooks/api/use-api';
import { CardSkeleton } from '@/components/custom/shimmer-loader';

// CORRECCIÓN: Nos aseguramos de recibir string o null, y por defecto evaluar un string vacío
const getTipoBadgeStyles = (tipo: string | null | undefined) => {
  const t = tipo?.toLowerCase() || '';
  if (t.includes('lab') || t.includes('analis')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (t.includes('clini') || t.includes('hosp')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (t.includes('estet') || t.includes('spa') || t.includes('pelu')) {
    return 'bg-pink-50 text-pink-700 border-pink-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200'; // Por defecto
};

export function PartnersSection() {
  const { data: alianzas, isLoading } = useAlianzas();

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50/50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block mb-3 border border-emerald-200">
            Red de Apoyo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Nuestras <span className="text-emerald-600">Alianzas Externas</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Trabajamos en conjunto con las mejores entidades médicas y laboratorios del país 
            para garantizar servicios integrales de alta complejidad.
          </p>
        </motion.div>

        {/* Lógica de Renderizado */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !alianzas || alianzas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <span className="text-4xl block mb-3">🤝</span>
            <p className="text-gray-500 font-medium">No se registran convenios externos activos en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alianzas.map((alianza, index) => {
              const badgeStyle = getTipoBadgeStyles(alianza.tipo);

              return (
                <motion.div
                  key={alianza.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full -z-10 group-hover:bg-emerald-50/30 transition-all duration-300" />

                  <div>
                    {/* Tipo e Indicador */}
                    <div className="flex justify-between items-center mb-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeStyle}`}>
                        {alianza.tipo || 'Convenio'}
                      </span>
                      {alianza.activo ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Activo
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                          Inactivo
                        </span>
                      )}
                    </div>

                    {/* Nombre */}
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 mb-3 leading-snug">
                      {alianza.nombre_entidad}
                    </h3>

                    {/* Detalles */}
                    <p className="text-sm text-gray-500 line-clamp-3 mb-6 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 min-h-[72px]">
                      {alianza.convenio_detalles || 'Convenio general de asistencia médica y apoyo logístico interinstitucional.'}
                    </p>
                  </div>

                  {/* Contacto y Acción */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contacto Directo</span>
                      <span className="text-sm font-bold text-gray-700 mt-0.5 flex items-center gap-1">
                        📞 {alianza.telefono || 'No disponible'}
                      </span>
                    </div>

                    <button 
                      // CORRECCIÓN: Validamos que exista un string real en telefono antes de la redirección 
                      onClick={() => {
                        if (alianza.telefono) {
                          window.location.href = `tel:${alianza.telefono}`;
                        }
                      }}
                      className="text-xs font-bold text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-4 py-2 rounded-xl border border-emerald-100 group-hover:border-emerald-600 transition-all duration-300 shadow-sm"
                    >
                      Contactar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}