'use client';

import { ThemeProvider } from 'next-themes';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <ThemeProvider attribute="class" disableTransitionOnChange>
    <MantineProvider
      theme={{
        // Adaptar colores de Mantine a tu paleta Tailwind
        primaryColor: 'blue',
        fontFamily: 'inherit', // Usa la fuente de Tailwind
        radius: {
          md: '0.5rem', // Consistente con rounded-lg de Tailwind
        },
        // Adaptar al dark mode de tu plantilla
        colors: {
          dark: [
            '#f5f5f5',
            '#e7e7e7',
            '#cdcdcd',
            '#b2b2b2',
            '#9a9a9a',
            '#8b8b8b',
            '#848484',
            '#717171',
            '#656565',
            '#1e293b', // slate-800 de tu plantilla
          ],
        },
      }}
    >
      {children}
    </MantineProvider>
  </ThemeProvider>
);

export default Providers;
