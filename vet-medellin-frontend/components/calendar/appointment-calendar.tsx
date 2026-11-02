'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cita } from '@/lib/types';
import { ESTADOS_CITA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AppointmentCalendarProps {
  citas: Cita[];
  onSelectCita?: (cita: Cita) => void;
  onSelectDate?: (date: Date) => void;
}

export function AppointmentCalendar({ citas, onSelectCita, onSelectDate }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: es });
  const calendarEnd = endOfWeek(monthEnd, { locale: es });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getCitasForDay = (day: Date) => {
    return citas.filter((cita) => {
      const citaDate = parseISO(cita.fecha_hora);
      return isSameDay(citaDate, day);
    });
  };

  const getStatusColor = (estado: Cita['estado']) => {
    const statusConfig = ESTADOS_CITA.find((s) => s.value === estado);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    onSelectDate?.(day);
  };

  const selectedDayCitas = selectedDate ? getCitasForDay(selectedDate) : [];

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      <div className="grid grid-cols-7">
        {/* Day names */}
        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayCitas = getCitasForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <motion.div
              key={day.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className={cn(
                'min-h-[100px] p-2 border-b border-r cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-gray-50 text-gray-400',
                isSelected && 'bg-emerald-50',
                !isSelected && isCurrentMonth && 'hover:bg-gray-50'
              )}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                    isToday && 'bg-emerald-600 text-white',
                    isSelected && !isToday && 'bg-emerald-200 text-emerald-800'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayCitas.length > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {dayCitas.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayCitas.slice(0, 3).map((cita) => (
                  <div
                    key={cita.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCita?.(cita);
                    }}
                    className={cn(
                      'text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity',
                      getStatusColor(cita.estado)
                    )}
                  >
                    {format(parseISO(cita.fecha_hora), 'HH:mm')} - {cita.mascota_nombre}
                  </div>
                ))}
                {dayCitas.length > 3 && (
                  <p className="text-xs text-gray-500 pl-1">+{dayCitas.length - 3} mas</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selectedDate && selectedDayCitas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-gray-50 p-4"
          >
            <h3 className="font-medium text-gray-800 mb-3">
              Citas para el {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </h3>
            <div className="space-y-2">
              {selectedDayCitas.map((cita) => (
                <div
                  key={cita.id}
                  onClick={() => onSelectCita?.(cita)}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800">
                        {format(parseISO(cita.fecha_hora), 'HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{cita.mascota_nombre}</p>
                      <p className="text-sm text-gray-500">
                        Dr. {cita.medico_nombre} {cita.medico_apellido}
                      </p>
                    </div>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded-full', getStatusColor(cita.estado))}>
                    {cita.estado}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
