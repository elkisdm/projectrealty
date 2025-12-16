import { Metadata } from 'next';
import HeroV2 from '@/components/marketing/HeroV2';
import FeaturedGrid from '@/components/marketing/FeaturedGrid';
import HowItWorks from '@/components/marketing/HowItWorks';
import Trust from '@/components/marketing/Trust';
import { SearchFormProvider } from '@/components/marketing/SearchFormContext';

export const metadata: Metadata = {
    title: 'Arrienda Sin Comisión - Encuentra tu hogar ideal',
    description: 'Descubre propiedades en arriendo sin comisión. Miles de opciones disponibles en las mejores ubicaciones de Chile.',
    keywords: 'arriendo sin comisión, propiedades, departamentos, casas, arriendo',
    openGraph: {
        title: 'Arrienda Sin Comisión - Encuentra tu hogar ideal',
        description: 'Descubre propiedades en arriendo sin comisión. Miles de opciones disponibles en las mejores ubicaciones de Chile.',
        type: 'website',
        locale: 'es_CL',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Arrienda Sin Comisión - Encuentra tu hogar ideal',
        description: 'Descubre propiedades en arriendo sin comisión. Miles de opciones disponibles en las mejores ubicaciones de Chile.',
    },
    alternates: {
        canonical: '/landing-v2',
    },
};

export default async function LandingV2Page() {
    return (
        <SearchFormProvider>
            <main className="min-h-screen bg-white dark:bg-gray-900">
                <HeroV2 />
                <FeaturedGrid />
                <HowItWorks />
                <Trust />
            </main>
        </SearchFormProvider>
    );
}
