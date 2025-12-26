export interface CommuneLifeData {
  name: string;
  slug: string;
  hero: {
    image: string;
    title: string;
    subtitle: string;
  };
  highlights: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  map: {
    image: string;
    pins: Array<{
      label: string;
      position: { x: number; y: number };
    }>;
  };
  testimonial: {
    avatar: string;
    quote: string;
    author: string;
    role: string;
  };
  cta: {
    text: string;
    href: string;
  };
}

export const estacionCentralData: CommuneLifeData = {
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
