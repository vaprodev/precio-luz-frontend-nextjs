import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import { getPricesToday } from '~/lib/api/precios-api';
import { computeMetrics } from '~/lib/precios/metrics';
import { formatPrice } from '~/lib/precios/formatters';

export const metadata = {
  title: 'Test Gráfico de Precios - API Real | Precio Luz Hoy',
  description: 'Página de prueba para validar la integración con API real',
};

// Force dynamic rendering (no cache)
export const dynamic = 'force-dynamic';

export default async function TestGraficoPage() {
  // Fetch real data from API
  const result = await getPricesToday();

  // Handle error state
  if (!result.ok || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-2">
              Error al cargar datos
            </h1>
            <p className="text-red-700 dark:text-red-400">
              No se pudieron obtener los precios: {result.error || 'Error desconocido'}
            </p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-2">
              Status: {result.status} | Tiempo: {result.ms}ms
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data } = result;
  const meta = computeMetrics(data.data, data.date);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Test: API Real ⚡
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validación de integración con {process.env.NEXT_PUBLIC_API_URL}
          </p>
        </div>

        {/* STATUS BADGES */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
            ✅ API Real
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
            ✅ TypeScript
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.info.isComplete
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {result.info.isComplete ? '✅' : '⏳'} {result.info.count}/24 horas
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
            🕒 {result.ms}ms
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
            📅 {data.date}
          </span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-sm font-medium">
            🗂️ Policy: {result.policy}
          </span>
        </div>

        {/* CHART COMPONENT */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Precio de la Luz Hoy - {data.date}
          </h2>
          <PriceChartView
            data={data.data}
            currentHourIndex={meta.currentHourIndex ?? undefined}
            min={meta.min ?? 0}
            max={meta.max ?? 0}
            activeDate={data.date}
          />
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Mínimo</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(meta.min)} €/kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hora más barata</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Medio</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatPrice(meta.mean)} €/kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Promedio del día</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Máximo</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatPrice(meta.max)} €/kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hora más cara</div>
          </div>
        </div>

        {/* BEST WINDOWS */}
        {meta.best2h && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
              <div className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">🌟 Mejor ventana 2h</div>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
                {String(meta.best2h.startIndex).padStart(2, '0')}:00 - {String(meta.best2h.startIndex + 2).padStart(2, '0')}:00
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                Total: {formatPrice(meta.best2h.total)} €/kWh
              </div>
            </div>

            {meta.bestWindow && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="text-sm text-blue-700 dark:text-blue-400 mb-2">💡 Mejor ventana {meta.bestWindow.duration}h</div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-300">
                  {String(meta.bestWindow.startIndex).padStart(2, '0')}:00 - {String(meta.bestWindow.startIndex + meta.bestWindow.duration).padStart(2, '0')}:00
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                  Media: {formatPrice(meta.bestWindow.mean)} €/kWh
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEST CHECKLIST */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Checklist de Testing</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className={result.ok ? "text-green-500 text-xl" : "text-red-500 text-xl"}>
                {result.ok ? '✓' : '✗'}
              </span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">API fetch exitoso</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Status {result.status} en {result.ms}ms
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className={data.count >= 24 ? "text-green-500 text-xl" : "text-yellow-500 text-xl"}>
                {data.count >= 24 ? '✓' : '⏳'}
              </span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Datos completos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {data.count}/24 horas recibidas
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className={meta.min != null && meta.max != null ? "text-green-500 text-xl" : "text-red-500 text-xl"}>
                {meta.min != null && meta.max != null ? '✓' : '✗'}
              </span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Metrics computados</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Min/Max/Mean calculados correctamente
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className={meta.best2h ? "text-green-500 text-xl" : "text-gray-400 text-xl"}>
                {meta.best2h ? '✓' : '—'}
              </span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Best 2h window</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {meta.best2h ? 'Ventana calculada' : 'No disponible'}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className={meta.currentHourIndex != null ? "text-green-500 text-xl" : "text-gray-400 text-xl"}>
                {meta.currentHourIndex != null ? '✓' : '—'}
              </span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Hora actual detectada</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {meta.currentHourIndex != null ? `Hora ${meta.currentHourIndex}` : 'No es hoy'}
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* TECHNICAL INFO */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">ℹ️ Información Técnica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-300 mb-2">API Layer:</div>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400">
                <li>• client.ts (fetch con retry)</li>
                <li>• precios-api.ts (servicios)</li>
                <li>• metrics.ts (cálculos)</li>
                <li>• date-utils.ts (timezone)</li>
                <li>• formatters.ts (formato ES)</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-300 mb-2">Response Info:</div>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400 font-mono text-xs">
                <li>• Date: {data.date}</li>
                <li>• Count: {data.count}</li>
                <li>• Complete: {result.info.isComplete ? 'Yes' : 'No'}</li>
                <li>• Policy: {result.policy}</li>
                <li>• Latency: {result.ms}ms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mt-8 flex justify-between items-center">
          <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Volver al inicio
          </a>
          <div className="text-sm text-gray-500 dark:text-gray-500">Fase 6 (API Real) ✅</div>
        </div>
      </div>
    </div>
  );
}
