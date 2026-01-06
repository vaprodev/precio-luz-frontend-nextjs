'use client';

/**
 * Test Page - Zustand Store Validation
 * Esta página prueba que el store de Zustand funciona correctamente
 * BORRAR después de validar Phase 2
 */

import { usePricesStore } from '@/hooks/usePricesStore';
import { getTodayMadridYmd, getTomorrowMadridYmd, getYesterdayMadridYmd } from '@/lib/precios/date-utils';

export default function TestStorePage() {
  const { activeDate, setActiveDate, resetToToday } = usePricesStore();

  const today = getTodayMadridYmd();
  const tomorrow = getTomorrowMadridYmd();
  const yesterday = getYesterdayMadridYmd();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Test: Zustand Store</h1>

          <div className="space-y-6">
            {/* Estado actual */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Estado Actual</h2>
              <p className="text-2xl font-mono text-blue-600 dark:text-blue-400">{activeDate}</p>
            </div>

            {/* Botones de prueba */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones de Prueba</h2>

              <button onClick={() => setActiveDate(yesterday)} className="btn btn-primary w-full">
                Cambiar a Ayer ({yesterday})
              </button>

              <button onClick={() => setActiveDate(today)} className="btn btn-primary w-full">
                Cambiar a Hoy ({today})
              </button>

              <button onClick={() => setActiveDate(tomorrow)} className="btn btn-primary w-full">
                Cambiar a Mañana ({tomorrow})
              </button>

              <button
                onClick={resetToToday}
                className="btn w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                Reset a Hoy
              </button>

              <button
                onClick={() => setActiveDate('2024-01-01')}
                className="btn w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                Cambiar a 2024-01-01
              </button>
            </div>

            {/* Instrucciones */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ✅ Criterios de Validación
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                <li>El valor inicial debe ser hoy ({today})</li>
                <li>Los botones deben cambiar la fecha mostrada</li>
                <li>El valor debe persistir entre re-renders</li>
                <li>El botón "Reset" debe volver a hoy</li>
                <li>No debe haber errores en consola</li>
              </ul>
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <strong>Nota:</strong> Esta página se borrará después de validar Phase 2.
              <br />
              Ubicación:{' '}
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">app/test-store/page.tsx</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
