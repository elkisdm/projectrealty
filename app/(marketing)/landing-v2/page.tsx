import { Metadata } from 'next';
import LandingV2Client from './LandingV2Client';

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
    return <LandingV2Client />;
}
