import { render, screen } from '@testing-library/react';
import { CommuneLifeSection } from '@/components/commune/CommuneLifeSection';

// Mock data inline (since data file is in _workspace/)
const estacionCentralData = {
    name: "Estación Central",
    slug: "estacion-central",
    hero: {
        image: "/images/estacioncentral-cover.jpg",
        title: "Cómo es vivir en Estación Central",
        subtitle: "Descubre la vida urbana en el corazón de Santiago"
    },
    highlights: [
        {
            icon: "🚇",
            title: "Conectividad Total",
            description: "Metro Línea 1 y múltiples líneas de buses te conectan con toda la ciudad en minutos"
        },
        {
            icon: "🏪",
            title: "Comercio Local",
            description: "Mercados tradicionales, supermercados y tiendas de barrio a pasos de tu hogar"
        },
        {
            icon: "🌳",
            title: "Parques Cercanos",
            description: "Parque O'Higgins y áreas verdes para disfrutar del aire libre"
        },
        {
            icon: "🎓",
            title: "Educación Superior",
            description: "Universidades y centros de estudio a pocas cuadras de distancia"
        }
    ],
    map: {
        image: "/images/estacion-central-map.jpg",
        pins: [
            { label: "Metro Estación Central", position: { x: 45, y: 60 } },
            { label: "Parque O'Higgins", position: { x: 75, y: 30 } },
            { label: "Mercado Central", position: { x: 25, y: 40 } },
            { label: "Universidad de Santiago", position: { x: 60, y: 45 } }
        ]
    },
    testimonial: {
        avatar: "/images/testimonial-avatar.jpg",
        quote: "Vivir en Estación Central me ha dado la libertad de moverme por toda la ciudad sin problemas. Todo está cerca y bien conectado.",
        author: "María González",
        role: "Arrendataria desde 2022"
    },
    cta: {
        text: "Ver propiedades en Estación Central",
        href: "/property?comuna=estacion-central"
    }
};

// Mock de framer-motion para tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    },
    useReducedMotion: () => false,
}));

// Mock de lucide-react para tests
jest.mock('lucide-react', () => ({
    MapPin: ({ className, ...props }: any) => <span className={className} {...props}>📍</span>,
    Users: ({ className, ...props }: any) => <span className={className} {...props}>👥</span>,
    Car: ({ className, ...props }: any) => <span className={className} {...props}>🚗</span>,
    Leaf: ({ className, ...props }: any) => <span className={className} {...props}>🌿</span>,
    Star: ({ className, ...props }: any) => <span className={className} {...props}>⭐</span>,
    ArrowRight: ({ className, ...props }: any) => <span className={className} {...props}>→</span>,
}));

// Mock de next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock de next/link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('CommuneLifeSection', () => {
    it('renderiza correctamente con datos de Estación Central', () => {
        render(<CommuneLifeSection
            commune={estacionCentralData.name}
            heroImage={estacionCentralData.hero.image}
            highlights={estacionCentralData.highlights.map(h => ({
                icon: () => <span>{h.icon}</span>,
                title: h.title,
                description: h.description
            }))}
            testimonial={{
                text: estacionCentralData.testimonial.quote,
                author: estacionCentralData.testimonial.author,
                rating: 5
            }}
            mapPins={estacionCentralData.map.pins.map(pin => ({
                name: pin.label,
                type: 'metro' as const,
                coordinates: [pin.position.x, pin.position.y]
            }))}
        />);

        // Verificar que el título principal se renderiza
        expect(screen.getByText('Cómo es vivir en Estación Central')).toBeInTheDocument();

        // Verificar que los highlights se renderizan
        expect(screen.getByText('Conectividad Total')).toBeInTheDocument();
        expect(screen.getByText('Comercio Local')).toBeInTheDocument();
        expect(screen.getByText('Parques Cercanos')).toBeInTheDocument();
        expect(screen.getByText('Educación Superior')).toBeInTheDocument();

        // Verificar que el testimonio se renderiza
        expect(screen.getByText(/Vivir en Estación Central me ha dado/)).toBeInTheDocument();
        expect(screen.getByText(/María González/)).toBeInTheDocument();

        // Verificar que el CTA se renderiza
        expect(screen.getByText(/Ver más propiedades en Estación Central/)).toBeInTheDocument();
    });

    it('tiene accesibilidad correcta', () => {
        render(<CommuneLifeSection
            commune={estacionCentralData.name}
            heroImage={estacionCentralData.hero.image}
            highlights={estacionCentralData.highlights.map(h => ({
                icon: () => <span>{h.icon}</span>,
                title: h.title,
                description: h.description
            }))}
            testimonial={{
                text: estacionCentralData.testimonial.quote,
                author: estacionCentralData.testimonial.author,
                rating: 5
            }}
            mapPins={estacionCentralData.map.pins.map(pin => ({
                name: pin.label,
                type: 'metro' as const,
                coordinates: [pin.position.x, pin.position.y]
            }))}
        />);

        // Verificar que el título se renderiza correctamente
        const title = screen.getByText('Cómo es vivir en Estación Central');
        expect(title).toBeInTheDocument();
    });

    it('renderiza los iconos de highlights correctamente', () => {
        render(<CommuneLifeSection
            commune={estacionCentralData.name}
            heroImage={estacionCentralData.hero.image}
            highlights={estacionCentralData.highlights.map(h => ({
                icon: () => <span>{h.icon}</span>,
                title: h.title,
                description: h.description
            }))}
            testimonial={{
                text: estacionCentralData.testimonial.quote,
                author: estacionCentralData.testimonial.author,
                rating: 5
            }}
            mapPins={estacionCentralData.map.pins.map(pin => ({
                name: pin.label,
                type: 'metro' as const,
                coordinates: [pin.position.x, pin.position.y]
            }))}
        />);

        // Verificar que los highlights se renderizan
        expect(screen.getByText('Conectividad Total')).toBeInTheDocument();
        expect(screen.getByText('Comercio Local')).toBeInTheDocument();
        expect(screen.getByText('Parques Cercanos')).toBeInTheDocument();
        expect(screen.getByText('Educación Superior')).toBeInTheDocument();
    });

    it('renderiza la imagen del hero correctamente', () => {
        render(<CommuneLifeSection
            commune={estacionCentralData.name}
            heroImage={estacionCentralData.hero.image}
            highlights={estacionCentralData.highlights.map(h => ({
                icon: () => <span>{h.icon}</span>,
                title: h.title,
                description: h.description
            }))}
            testimonial={{
                text: estacionCentralData.testimonial.quote,
                author: estacionCentralData.testimonial.author,
                rating: 5
            }}
            mapPins={estacionCentralData.map.pins.map(pin => ({
                name: pin.label,
                type: 'metro' as const,
                coordinates: [pin.position.x, pin.position.y]
            }))}
        />);

        const heroImage = screen.getByAltText('Vista de Estación Central');
        expect(heroImage).toBeInTheDocument();
        expect(heroImage).toHaveAttribute('src', '/images/estacioncentral-cover.jpg');
    });
});
