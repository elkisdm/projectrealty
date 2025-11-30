// Single Source of Truth para Flash Offer Landing
export interface FlashOfferContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    bullets: string[];
    cta: string;
  };
  socialProof: {
    title: string;
    description: string;
    avatars: string[];
    metrics: string;
  };
  benefits: {
    title: string;
    description: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  stats: {
    title: string;
    items: Array<{
      number: string;
      label: string;
    }>;
  };
  includes: {
    title: string;
    description: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  offer: {
    title: string;
    priceBefore: number;
    priceNow: number;
    savings: number;
    availableSpots: number;
    guarantee: string;
    urgency: string;
    cta: string;
  };
  roadmap: RoadmapStep[];
  upsells: {
    chatbot: {
      title: string;
      description: string;
      price: number;
      originalPrice: number;
      features: string[];
      disclaimer: string;
    };
    metaAds: {
      title: string;
      description: string;
      price: number;
      originalPrice: number;
      bundleNote: string;
    };
  };
  totals: {
    base: number;
    withChatbot: number;
    withMetaAds: number;
    fullBundle: number;
    bundleDiscount: number;
    urgencyNote: string;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  legal: {
    disclaimer: string;
    terms: string;
  };
  whatsapp: {
    number: string;
    message: string;
  };
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

// Utility functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

export const flashOfferContent: FlashOfferContent = {
  hero: {
    eyebrow: "🔥 OFERTA FLASH · SOLO 10 PLAZAS",
    title: "¿Tu departamento no se arrienda?",
    subtitle: "🎬 Pack Dúo de Videos que genera 10x más mensajes en 72 horas",
    bullets: [
      "✅ Entrega en 72h garantizada",
      "✅ Videos que convierten y venden",
      "✅ Sin trabajo de tu parte"
    ],
    cta: "🔥 RESERVAR MI PLAZA"
  },
  socialProof: {
    title: "Por qué confiar en mí",
    description: "Soy Elkis, corredor de propiedades con 3 años de experiencia. He ayudado a más de 260 propietarios a arrendar sus departamentos, generando más de $15M en ingresos orgánicos. Mi método de videos ha sido probado y optimizado para maximizar la conversión.",
    avatars: [
      "/images/avatar-1.jpg",
      "/images/avatar-2.jpg", 
      "/images/avatar-3.jpg",
      "/images/avatar-4.jpg",
      "/images/avatar-5.jpg"
    ],
    metrics: "260+ arriendos · 750k+ vistas · $15M orgánico"
  },
  benefits: {
    title: "¿Qué incluye el pack?",
    description: "Todo lo que necesitas para arrendar tu departamento en 7 días",
    items: [
      {
        icon: "🎥",
        title: "Grabación Profesional",
        description: "Videos de alta calidad con tu propio celular"
      },
      {
        icon: "🗣️",
        title: "Voz Mejorada",
        description: "Audio optimizado y captions automáticos"
      },
      {
        icon: "📝",
        title: "Portada + Captions",
        description: "Thumbnail atractivo y textos que venden"
      },
      {
        icon: "⚡",
        title: "Entrega Rápida",
        description: "Listo en 72 horas, garantizado"
      }
    ]
  },
  stats: {
    title: "Los números hablan por sí solos",
    items: [
      {
        number: "7",
        label: "días promedio"
      },
      {
        number: "260+",
        label: "arriendos exitosos"
      },
      {
        number: "750k+",
        label: "vistas generadas"
      },
      {
        number: "10",
        label: "plazas disponibles"
      }
    ]
  },
  includes: {
    title: "¿Qué incluye el pack?",
    description: "Todo lo que necesitas para arrendar tu departamento en 7 días",
    items: [
      {
        icon: "🎥",
        title: "Grabación Profesional",
        description: "Videos de alta calidad con tu propio celular"
      },
      {
        icon: "🗣️",
        title: "Voz Mejorada",
        description: "Audio optimizado y captions automáticos"
      },
      {
        icon: "📝",
        title: "Portada + Captions",
        description: "Thumbnail atractivo y textos que venden"
      },
      {
        icon: "⚡",
        title: "Entrega Rápida",
        description: "Listo en 72 horas, garantizado"
      }
    ]
  },
  offer: {
    title: "💎 Oferta Flash Limitada",
    priceBefore: 100000,
    priceNow: 80000,
    savings: 20000,
    availableSpots: 10,
    guarantee: "💯 100% devolución si no estás satisfecho",
    urgency: "⚡ Solo quedan 10 plazas - Se cierra en 48h",
    cta: "🔥 RESERVAR MI PLAZA AHORA"
  },
  roadmap: [
    {
      step: 1,
      title: "Coordinamos horario",
      description: "Agendamos una llamada de 15 minutos para entender tu departamento y definir la estrategia de videos.",
      duration: "15 min"
    },
    {
      step: 2,
      title: "Te envío guía de grabación",
      description: "Recibes una guía paso a paso con tips profesionales para grabar videos que convierten.",
      duration: "5 min"
    },
    {
      step: 3,
      title: "Grabas los videos",
      description: "Sigues la guía y grabas 2-3 videos cortos de tu departamento (no necesitas experiencia).",
      duration: "30 min"
    },
    {
      step: 4,
      title: "Me envías el material",
      description: "Subes los videos a Google Drive o WhatsApp y me los envías para edición.",
      duration: "5 min"
    },
    {
      step: 5,
      title: "Edito y optimizo",
      description: "Aplico técnicas de edición profesional, mejoro el audio y agrego captions optimizados para conversión.",
      duration: "48h"
    },
    {
      step: 6,
      title: "Te entrego listo",
      description: "Recibes 2 videos finales optimizados para TikTok/Instagram + guía de publicación para maximizar resultados.",
      duration: "24h"
    }
  ],
  upsells: {
    chatbot: {
      title: "🤖 Chatbot Automático",
      description: "Atiende consultas 24/7 y agenda visitas automáticamente",
      price: 50000,
      originalPrice: 75000,
      features: [
        "Responde consultas automáticamente 24/7",
        "Agenda visitas sin intervención humana",
        "Recopila información del inquilino",
        "Integración con WhatsApp Business"
      ],
      disclaimer: "El chatbot se configura después de entregar los videos"
    },
    metaAds: {
      title: "📢 Campaña Meta Ads",
      description: "Anuncios dirigidos que llegan a tu público ideal",
      price: 80000,
      originalPrice: 120000,
      bundleNote: "¡Perfecto! Si eliges ambos servicios, obtienes un descuento del 10% en el total"
    }
  },
  totals: {
    base: 80000,
    withChatbot: 130000,
    withMetaAds: 160000,
    fullBundle: 180000,
    bundleDiscount: 10000,
    urgencyNote: "⚠️ Esta oferta es limitada. Una vez completados los 10 cupos, el precio vuelve a $100.000"
  },
  faq: [
    {
      question: "¿Hay costos ocultos o sorpresas?",
      answer: "No. El precio que ves es el precio final. Incluye todo: edición, música libre de derechos, captions automáticos y 1 ajuste gratis. Sin costos adicionales."
    },
    {
      question: "¿Qué pasa si no me gustan los videos?",
      answer: "Incluimos 1 ajuste gratis. Si aún no estás satisfecho después del ajuste, te devolvemos el 100% del dinero. Sin preguntas."
    },
    {
      question: "¿Realmente entregan en 72 horas?",
      answer: "Sí, garantizado. Si por alguna razón no cumplo el plazo, te hago un video adicional gratis. En 3 años nunca he incumplido una entrega."
    },
    {
      question: "¿Por qué solo 10 cupos? ¿Es una estrategia de marketing?",
      answer: "No es marketing. Para mantener la calidad y entrega rápida, solo puedo trabajar con 10 clientes por mes. Una vez completados, la oferta se cierra hasta el próximo mes."
    }
  ],
  legal: {
    disclaimer: "Los resultados pueden variar según el mercado y la ubicación del inmueble. Garantizamos la entrega en 72 horas, no los resultados específicos de arriendo.",
    terms: "Servicio sujeto a disponibilidad. Precios en pesos chilenos. Válido hasta completar cupos disponibles."
  },
  whatsapp: {
    number: "56993481594",
    message: "Hola! Vi tu oferta del Pack Dúo de Videos y me interesa reservar una plaza. ¿Tienes disponibilidad?"
  }
};
