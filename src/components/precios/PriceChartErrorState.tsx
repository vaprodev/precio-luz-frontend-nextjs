/**
 * Error State Component
 * Shows user-friendly error messages when API fails
 */

interface ErrorStateProps {
  error: string | number | null;
  onRetry?: () => void;
}

export default function PriceChartErrorState({ error, onRetry }: ErrorStateProps) {
  const getErrorMessage = (error: string | number | null): { title: string; message: string; emoji: string } => {
    if (typeof error === 'number') {
      switch (error) {
        case 404:
          return {
            emoji: '🔍',
            title: 'Datos no encontrados',
            message: 'No se encontraron precios para esta fecha. Es posible que los datos aún no estén disponibles.',
          };
        case 429:
          return {
            emoji: '⏱️',
            title: 'Demasiadas solicitudes',
            message: 'Has realizado demasiadas peticiones. Por favor, espera un momento e intenta de nuevo.',
          };
        case 500:
        case 502:
        case 503:
          return {
            emoji: '🔧',
            title: 'Error del servidor',
            message: 'El servidor está experimentando problemas técnicos. Estamos trabajando para solucionarlo.',
          };
        default:
          return {
            emoji: '⚠️',
            title: 'Error al cargar datos',
            message: `Se produjo un error al obtener los precios (código: ${error}).`,
          };
      }
    }

    // String errors
    switch (error) {
      case 'network':
        return {
          emoji: '📡',
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        };
      case 'timeout':
        return {
          emoji: '⏰',
          title: 'Tiempo de espera agotado',
          message: 'La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.',
        };
      case 'missing-date':
        return {
          emoji: '📅',
          title: 'Fecha no especificada',
          message: 'No se especificó una fecha para consultar los precios.',
        };
      default:
        return {
          emoji: '❌',
          title: 'Error desconocido',
          message: error ? String(error) : 'Ocurrió un error inesperado al cargar los precios.',
        };
    }
  };

  const { emoji, title, message } = getErrorMessage(error);

  return (
    <div className="w-full">
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">{emoji}</div>

        <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">{title}</h3>

        <p className="text-red-700 dark:text-red-400 mb-6 max-w-md mx-auto">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reintentar
          </button>
        )}

        <div className="mt-6 text-sm text-red-600 dark:text-red-500">
          Si el problema persiste, por favor{' '}
          <a href="mailto:soporte@precioluzhoy.app" className="underline hover:text-red-700 dark:hover:text-red-400">
            contacta con soporte
          </a>
        </div>
      </div>
    </div>
  );
}
