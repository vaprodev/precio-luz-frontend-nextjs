import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import { mockPriceDataRaw, mockPriceStats, mockActiveDate, mockCurrentHour } from '~/shared/data/pages/precios.data';

export const metadata = {
  title: 'Test Gráfico de Precios | Precio Luz Hoy',
  description: 'Página de prueba para validar la migración del componente PriceChartView',
};

export default function TestGraficoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Test: Gráfico de Precios ⚡</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validación del componente PriceChartView migrado desde Legacy
          </p>
        </div>

        {/* STATUS BADGES */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
            ✅ TypeScript
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
            ✅ Recharts
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
            ✅ Mock Data
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
            🌙 Dark Mode
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
            📱 Responsive
          </span>
        </div>

        {/* CHART COMPONENT */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Gráfico con datos mock (24 horas)
          </h2>
          <PriceChartView
            data={mockPriceDataRaw}
            currentHourIndex={mockCurrentHour}
            min={mockPriceStats.min}
            max={mockPriceStats.max}
            activeDate={mockActiveDate}
          />
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Mínimo</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {mockPriceStats.min.toFixed(4)} €/kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hora más barata</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Medio</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mockPriceStats.mean.toFixed(4)} €/kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Promedio del día</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Máximo</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {mockPriceStats.max.toFixed(4)} €/kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hora más cara</div>
          </div>
        </div>

        {/* TEST CHECKLIST */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Checklist de Testing</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Componente renderiza correctamente</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">PriceChartView muestra 24 horas de datos</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Gráfico Recharts funciona</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Barras horizontales con colores por precio
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Formato de precios español</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">0,1234 €/kWh con 4 decimales</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Hora actual resaltada</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Fondo azul claro en la hora {mockCurrentHour}:00
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 text-xl">→</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Probar responsive</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Redimensionar ventana: mobile (375px), tablet (768px), desktop (1280px)
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 text-xl">→</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Probar dark mode</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toggle sistema de tema claro/oscuro</div>
              </div>
            </li>
          </ul>
        </div>

        {/* TECHNICAL INFO */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">ℹ️ Información Técnica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-300 mb-2">Componentes:</div>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400">
                <li>• PriceChartView (Server Component)</li>
                <li>• HourColumn (Server Component)</li>
                <li>• PriceColumn (Server Component)</li>
                <li>• BarsColumn (Client Component)</li>
                <li>• logic.ts (Pure functions)</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-300 mb-2">Datos mock:</div>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400">
                <li>• 24 puntos de precio (00:00-23:00)</li>
                <li>• Min: {mockPriceStats.min.toFixed(5)} €/kWh</li>
                <li>• Max: {mockPriceStats.max.toFixed(5)} €/kWh</li>
                <li>• Fecha: {mockActiveDate}</li>
                <li>• Hora actual: {mockCurrentHour}:00</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mt-8 flex justify-between items-center">
          <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Volver al inicio
          </a>
          <div className="text-sm text-gray-500 dark:text-gray-500">Migración completada • Fase 4 (Testing)</div>
        </div>
      </div>
    </div>
  );
}
