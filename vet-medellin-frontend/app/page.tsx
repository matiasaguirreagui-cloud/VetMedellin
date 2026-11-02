'use client';

import { HeroSection } from '@/components/home/hero-section';
import { VaccinesGrid } from '@/components/home/vaccines-grid';
import { PartnersSection } from '@/components/home/partners-section';
import dynamic from 'next/dynamic';

// CORRECCIÓN DE RUTA: Apuntamos exactamente al archivo físico 'card-product-3d'
const CardProduct3D = dynamic(
  () => import('@/components/3d/card-product-3d').then((mod) => mod.CardProduct3D),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400 font-medium">
          CUIDA A TU MASCOTA CON LA MEJOR ATENCION
        </div>
      </div>
    )
  }
);

export default function HomePage() {
  return (
    <>
      <HeroSection />
      
      {/* Sección destacada con el visor 3D interactivo en la Home */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Equipamiento Especializado
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
                Tecnología interactiva para el cuidado de tu mascota
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Explora de manera tridimensional los productos, medicamentos y suplementos oficiales distribuidos directamente en nuestra sede de Medellín. Interactúa con el modelo arrastrándolo con el mouse.
              </p>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300" />
              <div className="relative border border-gray-100 rounded-xl overflow-hidden bg-white shadow-xs">
                <CardProduct3D 
                  productName="Suplemento VetMedellín Premium" 
                  category="alimento" 
                  color="#10B981" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <VaccinesGrid />
      <PartnersSection />
      
      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <ellipse cx="12" cy="14" rx="5" ry="4" />
                <ellipse cx="7" cy="8" rx="2" ry="2.5" transform="rotate(-15 7 8)" />
                <ellipse cx="17" cy="8" rx="2" ry="2.5" transform="rotate(15 17 8)" />
                <ellipse cx="9.5" cy="6" rx="1.8" ry="2.3" transform="rotate(-5 9.5 6)" />
                <ellipse cx="14.5" cy="6" rx="1.8" ry="2.3" transform="rotate(5 14.5 6)" />
              </svg>
              <span className="font-semibold text-gray-800">VetMedellin</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 VetMedellin. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}