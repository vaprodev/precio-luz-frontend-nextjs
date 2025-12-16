import ElectricityPrices from '~/components/widgets/ElectricityPrices';
import Hero from '~/components/widgets/Hero';
import { heroHome } from '~/shared/data/pages/home.data';

export const metadata = {
  title: 'Demo: Homepage con Datos API Reales',
  description: 'Demostración del widget ElectricityPrices con datos reales del API',
};

export default function DemoHomePage() {
  return (
    <>
      {/* Hero section */}
      <Hero {...heroHome} />

      {/* Electricity Prices Widget - NOW WITH REAL API DATA */}
      <ElectricityPrices
        id="precios-hoy"
        hasBackground={true}
        header={{
          title: 'Precio de la Luz Hoy',
          subtitle: 'Consulta el precio de la electricidad hora a hora y ahorra en tu factura',
          tagline: 'Precios en Tiempo Real',
        }}
      />

      {/* Spacer */}
      <div className="py-10"></div>
    </>
  );
}
