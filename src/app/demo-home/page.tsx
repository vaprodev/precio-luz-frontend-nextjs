import ElectricityPrices from '~/components/widgets/ElectricityPrices';
import { electricityPricesHome } from '~/shared/data/pages/home.data';
import Hero from '~/components/widgets/Hero';
import { heroHome } from '~/shared/data/pages/home.data';

export const metadata = {
  title: 'Demo: Homepage con Widget ElectricityPrices',
  description: 'Demostración del widget ElectricityPrices integrado en la homepage',
};

export default function DemoHomePage() {
  return (
    <>
      {/* Hero section */}
      <Hero {...heroHome} />

      {/* Electricity Prices Widget - MIGRATED COMPONENT */}
      <ElectricityPrices {...electricityPricesHome} />

      {/* Spacer */}
      <div className="py-10"></div>
    </>
  );
}
