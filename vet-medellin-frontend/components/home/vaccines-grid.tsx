'use client';

import { motion } from 'framer-motion';
import { useVacunas } from '@/hooks/api/use-api';
import { CardSkeleton } from '@/components/custom/shimmer-loader';

// Íconos y colores dinámicos para darle vida a las tarjetas de vacunas
const vaccineStyles = [
  { icon: '💉', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { icon: '🛡️', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { icon: '🔬', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { icon: '💊', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  { icon: '🧬', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  { icon: '🩺', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
];

export function VaccinesGrid() {
  const { data: vacunas, isLoading } = useVacunas();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la sección */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Esquema de <span className="text-emerald-600">Vacunación</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Protege a tu mascota con nuestras vacunas de primera calidad. 
            Conoce el tiempo de inmunidad exacto de cada una de ellas.
          </p>
        </motion.div>

        {/* Lógica de Renderizado */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !vacunas || vacunas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-gray-500 font-medium">No hay vacunas registradas en el sistema por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacunas.map((vacuna, index) => {
              // Asignación de estilos dinámicos
              const style = vaccineStyles[index % vaccineStyles.length];
              const meses = vacuna.dias_validez ? Math.floor(vacuna.dias_validez / 30) : null;

              return (
                <motion.div
                  key={vacuna.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-2xl p-6 border ${style.border} shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center text-2xl shrink-0 shadow-inner`}>
                      {style.icon}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 w-full">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                        {vacuna.nombre_vacuna}
                      </h3>
                      
                      <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                          ⏱️ {vacuna.dias_validez ? `${vacuna.dias_validez} días de protección` : 'Consulta médica'}
                        </div>
                        
                        {/* Barra de Progreso de Inmunidad */}
                        {vacuna.dias_validez && (
                          <div className="space-y-2 mt-1">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <span>Inmunidad</span>
                              <span className={style.text}>{meses} {meses === 1 ? 'mes' : 'meses'}</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <motion.div
                                className={`h-full ${style.bg.replace('100', '500')}`}
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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