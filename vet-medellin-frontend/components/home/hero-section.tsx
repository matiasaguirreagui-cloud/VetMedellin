'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  // Estado para controlar que los SVGs aleatorios solo se rendericen en el navegador
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Sistema de Gestión Veterinaria
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              Cuidamos a tus{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                mascotas
              </span>{' '}
              como familia
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 mb-8 max-w-lg"
            >
              VetMedellín ofrece atención veterinaria integral con los mejores especialistas. 
              Gestión de citas, historias clínicas, vacunación y mucho más en un solo lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/citas">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:-translate-y-1 transition-all duration-200">
                  Agendar Cita
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/medicos">
                <Button size="lg" variant="outline" className="hover:-translate-y-1 transition-all duration-200">
                  Conocer Equipo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 mt-12 pt-8 border-t border-gray-200"
            >
              {[
                { value: '5,000+', label: 'Mascotas atendidas' },
                { value: '15+', label: 'Años de experiencia' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Animated paw prints background (Solucionado el error de hidratación) */}
              <div className="absolute inset-0">
                {isMounted && [...Array(6)].map((_, i) => (
                  <motion.svg
                    key={i}
                    className="absolute text-emerald-200"
                    style={{
                      width: 40 + Math.random() * 30,
                      height: 40 + Math.random() * 30,
                      left: `${Math.random() * 80}%`,
                      top: `${Math.random() * 80}%`,
                    }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    initial={{ opacity: 0, scale: 0, rotate: Math.random() * 360 }}
                    animate={{ 
                      opacity: [0.2, 0.5, 0.2], 
                      scale: [1, 1.1, 1],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  >
                    <ellipse cx="12" cy="14" rx="5" ry="4" />
                    <ellipse cx="7" cy="8" rx="2" ry="2.5" transform="rotate(-15 7 8)" />
                    <ellipse cx="17" cy="8" rx="2" ry="2.5" transform="rotate(15 17 8)" />
                    <ellipse cx="9.5" cy="6" rx="1.8" ry="2.3" transform="rotate(-5 9.5 6)" />
                    <ellipse cx="14.5" cy="6" rx="1.8" ry="2.3" transform="rotate(5 14.5 6)" />
                  </motion.svg>
                ))}
              </div>

              {/* Main illustration card */}
              <motion.div
                className="absolute inset-8 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50" />
                <div className="relative h-full flex flex-col items-center justify-center p-8">
                  <motion.svg
                    className="w-32 h-32 text-emerald-600 mb-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ellipse cx="12" cy="14" rx="5" ry="4" />
                    <ellipse cx="7" cy="8" rx="2" ry="2.5" transform="rotate(-15 7 8)" />
                    <ellipse cx="17" cy="8" rx="2" ry="2.5" transform="rotate(15 17 8)" />
                    <ellipse cx="9.5" cy="6" rx="1.8" ry="2.3" transform="rotate(-5 9.5 6)" />
                    <ellipse cx="14.5" cy="6" rx="1.8" ry="2.3" transform="rotate(5 14.5 6)" />
                  </motion.svg>
                  <p className="text-xl font-semibold text-gray-800">VetMedellín</p>
                  <p className="text-sm text-gray-500 mt-1">Cuidado integral</p>
                </div>
              </motion.div>

              {/* Floating cards */}
              <motion.div
                className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg p-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Cita confirmada</p>
                    <p className="text-xs text-gray-500">Max - 10:00 AM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -left-4 bottom-32 bg-white rounded-xl shadow-lg p-4"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Vacuna aplicada</p>
                    <p className="text-xs text-gray-500">Rabia - Luna</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}