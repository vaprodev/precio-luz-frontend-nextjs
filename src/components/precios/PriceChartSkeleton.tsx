/**
 * Loading Skeleton for Price Chart
 * Shows animated skeleton while data is being fetched
 */

export default function PriceChartSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6 space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>

      {/* Chart skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {/* Chart header */}
        <div className="mb-4 flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        </div>

        {/* Chart grid */}
        <div className="space-y-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Hour label */}
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>

              {/* Bar */}
              <div
                className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"
                style={{
                  width: `${Math.random() * 60 + 40}%`, // Random width for visual variety
                }}
              ></div>

              {/* Price label */}
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
