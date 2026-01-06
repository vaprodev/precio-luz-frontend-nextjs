/**
 * pricesStore.ts
 * Store global de Zustand para manejar el estado de la fecha activa en la aplicación
 * NO inicializa automáticamente - espera a que useTomorrowAvailability decida
 * la fecha inicial basándose en si mañana tiene datos completos
 */

import { create } from 'zustand';
import { getTodayMadridYmd } from '@/lib/precios/date-utils';

interface PricesState {
  /**
   * Fecha activa en formato YYYY-MM-DD (zona horaria de Madrid)
   * null hasta que useTomorrowAvailability setee la fecha inicial
   * Ejemplo: "2025-01-06"
   */
  activeDate: string | null;

  /**
   * Actualiza la fecha activa
   * @param newDate - Nueva fecha en formato YYYY-MM-DD
   */
  setActiveDate: (newDate: string) => void;

  /**
   * Reinicia la fecha activa al día de hoy en Madrid
   */
  resetToToday: () => void;
}

export const usePricesStore = create<PricesState>((set) => ({
  // Estado inicial: null (será seteado por useTomorrowAvailability)
  // NO inicializar aquí para evitar flash de "hoy" → "mañana"
  activeDate: null,

  // Acción para cambiar la fecha
  setActiveDate: (newDate: string) => set({ activeDate: newDate }),

  // Acción para reiniciar a hoy
  resetToToday: () => set({ activeDate: getTodayMadridYmd() }),
}));
