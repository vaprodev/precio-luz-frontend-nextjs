'use client';

/**
 * Test Page - MiniCalendar Validation
 * Esta página prueba el componente MiniCalendarMantine
 * BORRAR después de validar Phase 3
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MiniCalendarMantine from '@/components/precios/MiniCalendarMantine';
import { usePricesStore } from '@/hooks/usePricesStore';

// Cliente de React Query para el test
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Mock function para simular fetch de precios
 * En producción, esto vendría de tu API
 */
async function mockFetchPrices(ymd: string) {
  console.log(`[Mock] Fetching prices for ${ymd}`);

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simular datos: fechas futuras no tienen datos
  const today = new Date().toISOString().split('T')[0];
  const targetDate = new Date(ymd);
  const todayDate = new Date(today);

  if (targetDate > todayDate) {
    return { count: 0, data: [] };
  }

  // Fechas pasadas/hoy tienen 24 horas de datos
  return {
    count: 24,
    data: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      price: Math.random() * 100,
    })),
  };
}

function TestCalendarContent() {
  const { activeDate } = usePricesStore();
  const [tomorrowAvailable, setTomorrowAvailable] = React.useState(false);
  const [numberOfDays, setNumberOfDays] = React.useState(7);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test: MiniCalendar Mantine</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validación del componente de calendario integrado con Zustand y React Query
          </p>
        </div>

        {/* Estado actual */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📅 Fecha Activa (Zustand Store)</h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-3xl font-mono text-blue-600 dark:text-blue-400 text-center">{activeDate}</p>
          </div>
        </div>

        {/* Grid con Calendar y Controles */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendario */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🗓️ MiniCalendar</h2>
            <div className="flex justify-center">
              <MiniCalendarMantine
                numberOfDays={numberOfDays}
                tomorrowAvailable={tomorrowAvailable}
                fetchPricesFn={mockFetchPrices}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚙️ Controles de Prueba</h2>

            <div className="space-y-4">
              {/* Tomorrow Available Toggle */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tomorrowAvailable}
                    onChange={(e) => setTomorrowAvailable(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">Tomorrow Available</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-8">
                  {tomorrowAvailable ? 'Permite seleccionar hasta mañana' : 'Solo permite seleccionar hasta hoy'}
                </p>
              </div>

              {/* Number of Days Slider */}
              <div>
                <label className="block text-gray-900 dark:text-white font-medium mb-2">
                  Días Visibles: {numberOfDays}
                </label>
                <input
                  type="range"
                  min="5"
                  max="14"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5</span>
                  <span>14</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist de Validación */}
        <div className="card p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
            ✅ Checklist de Validación Phase 3
          </h2>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>El calendario muestra {numberOfDays} días visibles</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>La fecha activa ({activeDate}) está seleccionada en el calendario</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Los domingos aparecen en color rojo</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>Con "Tomorrow Available" OFF: solo permite seleccionar hasta hoy</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
              <span>Con "Tomorrow Available" ON: permite seleccionar hasta mañana</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">6.</span>
              <span>Al hacer clic en una fecha, el valor en "Fecha Activa" se actualiza inmediatamente</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">7.</span>
              <span>En la consola del navegador (F12), deberías ver logs de prefetch de 7 días</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">8.</span>
              <span>En Network tab (F12), verifica que se hacen requests de prefetch en paralelo</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">9.</span>
              <span>No hay errores en la consola del navegador</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">10.</span>
              <span>Cambiar el slider de "Días Visibles" actualiza el número de días mostrados</span>
            </li>
          </ul>
        </div>

        {/* Instrucciones */}
        <div className="card p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">📝 Instrucciones</h2>
          <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
            <p>
              <strong>1. Abrir DevTools (F12)</strong> y ver la pestaña Console para logs de prefetch
            </p>
            <p>
              <strong>2. Ir a Network tab</strong> para verificar las peticiones en paralelo
            </p>
            <p>
              <strong>3. Hacer clic en diferentes fechas</strong> y verificar que la "Fecha Activa" se actualiza
            </p>
            <p>
              <strong>4. Toggle "Tomorrow Available"</strong> y verificar que cambia la fecha máxima seleccionable
            </p>
            <p>
              <strong>5. Cambiar el slider</strong> para ver diferentes números de días
            </p>
            <p className="pt-2 border-t border-green-300 dark:border-green-700 mt-4">
              <strong>Nota:</strong> Esta página se borrará después de validar Phase 3.
              <br />
              Ubicación:{' '}
              <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">
                app/test-calendar/page.tsx
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestCalendarPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestCalendarContent />
    </QueryClientProvider>
  );
}
