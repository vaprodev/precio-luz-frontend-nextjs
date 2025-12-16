/**
 * Price Formatting Utilities
 */

/**
 * Format price in €/kWh to Spanish locale
 * @param price - Price in €/kWh
 * @param decimals - Number of decimal places (default: 4)
 */
export function formatPrice(price: number | null | undefined, decimals: number = 4): string {
  if (price == null || !Number.isFinite(price)) {
    return '—';
  }

  return price.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format price with currency symbol
 */
export function formatPriceWithCurrency(price: number | null | undefined, decimals: number = 4): string {
  if (price == null || !Number.isFinite(price)) {
    return '—';
  }

  return `${formatPrice(price, decimals)} €/kWh`;
}
