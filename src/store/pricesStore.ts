/**
 * pricesStore.ts
 * Store global de Zustand para manejar el estado de la fecha activa en la aplicación
 * Inicializa en "hoy" en la zona horaria de Madrid (Europe/Madrid)
 */

import { create } from 'zustand';
import { getTodayMadridYmd } from '@/lib/precios/date-utils';

interface PricesState {
  /**
   * Fecha activa en formato YYYY-MM-DD (zona horaria de Madrid)
   * Ejemplo: "2025-01-06"
   */
  activeDate: string;

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
  // Estado inicial: hoy en Madrid
  activeDate: getTodayMadridYmd(),

  // Acción para cambiar la fecha
  setActiveDate: (newDate: string) => set({ activeDate: newDate }),

  // Acción para reiniciar a hoy
  resetToToday: () => set({ activeDate: getTodayMadridYmd() }),
}));
