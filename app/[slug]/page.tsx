import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dayjs from 'dayjs';
import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import DateNavigator from '~/components/precios/DateNavigator';
import { getPricesByDate } from '~/lib/api/precios-api';
import { computeMetrics } from '~/lib/precios/metrics';
import { formatPrice } from '~/lib/precios/formatters';
import {
  parseSlugToDate,
  getTodaySlug,
  getTomorrowSlug,
  formatDateForDisplay,
  isValidDate,
  createSlugFromDate,
} from '~/lib/precios/slug-utils';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs: string[] = [];
  slugs.push(getTodaySlug());
  slugs.push(getTomorrowSlug());
  for (let i = 1; i <= 7; i++) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    slugs.push(createSlugFromDate(date));
  }
  return slugs.map((slug) => ({ slug: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  if (!resolvedParams || !resolvedParams.slug) {
    return {
      title: 'Precio de la Luz | Precio Luz Hoy',
      description: 'Consulta el precio de la luz por hora.',
    };
  }
  const parsed = parseSlugToDate(resolvedParams.slug);
  if (!parsed) {
    return {
      title: 'Precio de la Luz | Precio Luz Hoy',
      description: 'Consulta el precio de la luz por hora.',
    };
  }
  const displayTitle =
    parsed.type === 'hoy'
      ? `Precio de la Luz Hoy ${parsed.dateDisplay} - Consulta por Hora`
      : parsed.type === 'manana'
        ? `Precio de la Luz Mañana ${parsed.dateDisplay} - Planifica tu Consumo`
        : `Precio de la Luz ${parsed.dateDisplay} - Datos Históricos`;
  const description =
    parsed.type === 'hoy'
      ? `Consulta el precio de la luz hora a hora para hoy ${parsed.dateDisplay}. Ahorra en tu factura de luz con nuestro gráfico interactivo.`
      : parsed.type === 'manana'
        ? `Precio de la luz mañana ${parsed.dateDisplay}. Planifica tu consumo con los mejores horarios.`
        : `Precio de la luz del día ${parsed.dateDisplay}. Analiza datos históricos.`;
  return {
    title: displayTitle,
    description,
    openGraph: {
      title: displayTitle,
      description,
      type: 'website',
    },
  };
}

export default async function PrecioLuzPage({ params }: PageProps) {
  const resolvedParams = await params;
  if (!resolvedParams || !resolvedParams.slug) {
    notFound();
  }
  const parsed = parseSlugToDate(resolvedParams.slug);
  if (!parsed || !isValidDate(parsed.dateIso)) {
    notFound();
  }
  const response = await getPricesByDate(parsed.dateIso);
  if (!response.ok || !response.data || !response.data.data || response.data.data.length === 0) {
    notFound();
  }
  const prices = response.data.data;
  const metrics = computeMetrics(prices, parsed.dateIso);

  const currentHour = parsed.type === 'hoy' ? dayjs().hour() : null;
  const currentPrice = currentHour !== null && prices[currentHour] ? prices[currentHour].priceEurKwh : null;

  const minHour = prices.findIndex((p) => p.priceEurKwh === metrics.min);
  const maxHour = prices.findIndex((p) => p.priceEurKwh === metrics.max);

  const pageTitle =
    parsed.type === 'hoy'
      ? `Precio de la Luz Hoy ${parsed.dateDisplay}`
      : parsed.type === 'manana'
        ? `Precio de la Luz Mañana ${parsed.dateDisplay}`
        : `Precio de la Luz del ${parsed.dateDisplay}`;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">{pageTitle}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {parsed.type === 'hoy' && 'Precios actualizados cada 5 minutos'}
          {parsed.type === 'manana' && 'Planifica tu consumo con anticipación'}
          {parsed.type === 'pasado' && 'Datos históricos del día seleccionado'}
        </p>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {currentPrice !== null && (
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Actual</div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(currentPrice)} €/kWh
            </div>
          </div>
        )}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Medio</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.mean !== null ? formatPrice(metrics.mean) : 'N/A'} €/kWh
          </div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow dark:bg-green-900/20">
          <div className="text-sm font-medium text-green-700 dark:text-green-400">Más Barato</div>
          <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            {metrics.min !== null ? formatPrice(metrics.min) : 'N/A'} €/kWh
          </div>
          {minHour >= 0 && (
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              a las {minHour.toString().padStart(2, '0')}:00h
            </div>
          )}
        </div>
        <div className="rounded-lg bg-red-50 p-4 shadow dark:bg-red-900/20">
          <div className="text-sm font-medium text-red-700 dark:text-red-400">Más Caro</div>
          <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.max !== null ? formatPrice(metrics.max) : 'N/A'} €/kWh
          </div>
          {maxHour >= 0 && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
              a las {maxHour.toString().padStart(2, '0')}:00h
            </div>
          )}
        </div>
      </div>
      <div className="mb-6">
        <DateNavigator currentSlug={resolvedParams.slug} />
      </div>
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Gráfico de Precios por Hora</h2>
        <PriceChartView
          data={prices}
          currentHourIndex={metrics.currentHourIndex ?? undefined}
          min={metrics.min ?? undefined}
          max={metrics.max ?? undefined}
          activeDate={parsed.dateIso}
        />
      </div>
      <div className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
        <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-300">💡 Consejos para ahorrar</h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Programa electrodomésticos de alto consumo en las horas más baratas</li>
          <li>• Evita las horas punta (generalmente 18:00 - 22:00)</li>
          <li>• Aprovecha las horas valle (generalmente madrugada) para lavadora, lavavajillas, etc.</li>
        </ul>
      </div>
    </div>
  );
}

export const revalidate = 300;
