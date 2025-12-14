import { Metadata } from 'next';

interface FlashVideosJsonLdProps {
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    availability?: string;
    validFrom?: string;
    validThrough?: string;
}

export function FlashVideosJsonLd({
    title = "Pack Dúo de Videos - Flash Offer",
    description = "2 videos profesionales que venden tu arriendo en 72 horas. Oferta por tiempo limitado.",
    price = 50,
    currency = "USD",
    availability = "InStock",
    validFrom = new Date().toISOString(),
    validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
}: FlashVideosJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Offer",
        "name": title,
        "description": description,
        "price": price,
        "priceCurrency": currency,
        "availability": `https://schema.org/${availability}`,
        "validFrom": validFrom,
        "validThrough": validThrough,
        "seller": {
            "@type": "Organization",
            "name": "Hommie",
            "url": "https://hommie.cl"
        },
        "itemOffered": {
            "@type": "Service",
            "name": "Pack Dúo de Videos Profesionales",
            "description": "Servicio de creación de videos profesionales para marketing inmobiliario",
            "category": "Marketing Inmobiliario",
            "provider": {
                "@type": "Organization",
                "name": "Hommie",
                "url": "https://hommie.cl"
            }
        },
        "offers": [
            {
                "@type": "Offer",
                "name": "Pack Base",
                "price": 50,
                "priceCurrency": "USD",
                "description": "2 videos profesionales + entrega en 72h"
            },
            {
                "@type": "Offer",
                "name": "Pack + Meta Ads",
                "price": 100,
                "priceCurrency": "USD",
                "description": "Pack Base + configuración de Meta Ads"
            },
            {
                "@type": "Offer",
                "name": "Pack + ManyChat",
                "price": 150,
                "priceCurrency": "USD",
                "description": "Pack Base + ManyChat + Meta Ads"
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
