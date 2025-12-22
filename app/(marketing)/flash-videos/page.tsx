import { Metadata } from 'next';
import { FlashVideosClient } from '@/components/marketing/FlashVideosClient';
import { FlashVideosJsonLd } from '@/components/seo/FlashVideosJsonLd';
import { OptimizedImages } from '@/components/seo/OptimizedImages';

export const metadata: Metadata = {
    title: 'Pack Dúo de Videos - Vende tu arriendo en 72 horas',
    description: '2 videos profesionales que venden tu arriendo en 72 horas. Oferta por tiempo limitado. Solo 10 cupos disponibles.',
    keywords: 'videos inmobiliarios, marketing inmobiliario, pack dúo, videos profesionales, arriendo',
    openGraph: {
        title: 'Pack Dúo de Videos - Vende tu arriendo en 72 horas',
        description: '2 videos profesionales que venden tu arriendo en 72 horas. Oferta por tiempo limitado. Solo 10 cupos disponibles.',
        type: 'website',
        locale: 'es_CL',
        images: [
            {
                url: '/images/flash-videos-og.jpg',
                width: 1200,
                height: 630,
                alt: 'Pack Dúo de Videos - Vende tu arriendo en 72 horas',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pack Dúo de Videos - Vende tu arriendo en 72 horas',
        description: '2 videos profesionales que venden tu arriendo en 72 horas. Oferta por tiempo limitado. Solo 10 cupos disponibles.',
        images: ['/images/flash-videos-twitter.jpg'],
    },
    alternates: {
        canonical: '/flash-videos',
    },
};

export default function FlashVideosPage() {
    return (
        <>
            <FlashVideosJsonLd />
            <OptimizedImages />
            <FlashVideosClient />
        </>
    );
}
