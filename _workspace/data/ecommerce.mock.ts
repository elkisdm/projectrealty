import type { Product, Category, Variant, ExtendedProduct } from "@schemas/ecommerce";
import type { Bundle, ExpertQuote, FAQItem, EducationBlock, Benefit, AnnouncementConfig } from "@schemas/ecommerce";
import type { Review } from "@schemas/review";

// Categorías de suplementos
export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Proteínas",
    slug: "proteinas",
    description: "Proteínas en polvo para ganar masa muscular y recuperación",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    productCount: 8,
  },
  {
    id: "cat-2",
    name: "Creatina",
    slug: "creatina",
    description: "Suplementos de creatina para mejorar el rendimiento",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    productCount: 4,
  },
  {
    id: "cat-3",
    name: "Pre-Workout",
    slug: "pre-workout",
    description: "Energía y resistencia para tus entrenamientos",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    productCount: 5,
  },
  {
    id: "cat-4",
    name: "Vitaminas",
    slug: "vitaminas",
    description: "Multivitamínicos y suplementos vitamínicos",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    productCount: 6,
  },
  {
    id: "cat-5",
    name: "Quemadores",
    slug: "quemadores",
    description: "Suplementos para pérdida de peso y definición",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    productCount: 4,
  },
  {
    id: "cat-6",
    name: "Aminoácidos",
    slug: "aminoacidos",
    description: "BCAA, EAA y aminoácidos esenciales",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    productCount: 3,
  },
];

// Helper para generar variantes
const createVariants = (
  basePrice: number,
  options: { option1?: string[]; option2?: string[] }
): Variant[] => {
  const variants: Variant[] = [];
  const option1Values = options.option1 || ["Default"];
  const option2Values = options.option2 || [];

  if (option2Values.length > 0) {
    // Variantes con dos opciones (ej: Sabor + Tamaño)
    option1Values.forEach((opt1) => {
      option2Values.forEach((opt2, idx) => {
        const priceMultiplier = idx === 0 ? 1 : idx === 1 ? 1.2 : 1.5;
        variants.push({
          id: `var-${opt1.toLowerCase()}-${opt2.toLowerCase()}`,
          title: `${opt1} - ${opt2}`,
          price: Math.round(basePrice * priceMultiplier),
          compareAtPrice: Math.round(basePrice * priceMultiplier * 1.15),
          sku: `SKU-${opt1.substring(0, 3).toUpperCase()}-${opt2.substring(0, 3).toUpperCase()}`,
          inventory: Math.floor(Math.random() * 50) + 10,
          available: true,
          option1: opt1,
          option2: opt2,
          weight: opt2.includes("1kg") ? 1000 : opt2.includes("2kg") ? 2000 : 500,
          weightUnit: "g",
        });
      });
    });
  } else {
    // Variantes con una opción
    option1Values.forEach((opt1, idx) => {
      const priceMultiplier = idx === 0 ? 1 : 1.2;
      variants.push({
        id: `var-${opt1.toLowerCase()}`,
        title: opt1,
        price: Math.round(basePrice * priceMultiplier),
        compareAtPrice: Math.round(basePrice * priceMultiplier * 1.15),
        sku: `SKU-${opt1.substring(0, 3).toUpperCase()}`,
        inventory: Math.floor(Math.random() * 50) + 10,
        available: true,
        option1: opt1,
        weight: 500,
        weightUnit: "g",
      });
    });
  }

  return variants;
};

// Productos de suplementos
export const products: ExtendedProduct[] = [
  // PROTEÍNAS
  {
    id: "prod-1",
    handle: "whey-protein-vanilla",
    title: "Whey Protein Premium - Vainilla",
    description:
      "Proteína de suero de leche de alta calidad con 25g de proteína por porción. Ideal para ganar masa muscular y recuperación post-entrenamiento.",
    descriptionHtml:
      "<p>Proteína de suero de leche de alta calidad con <strong>25g de proteína</strong> por porción. Ideal para ganar masa muscular y recuperación post-entrenamiento.</p>",
    price: 24990,
    compareAtPrice: 29990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=80&auto=format",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=80&auto=format&dpr=2",
    ],
    variants: createVariants(24990, {
      option1: ["Vainilla", "Chocolate", "Fresa"],
      option2: ["1kg", "2kg", "5kg"],
    }),
    tags: ["proteina", "whey", "musculo", "recuperacion"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Proteína en Polvo",
    available: true,
    inventory: 45,
    rating: 4.8,
    reviewCount: 234,
    ingredients: [
      "Proteína de suero de leche",
      "Cacao en polvo",
      "Stevia",
      "Aromatizante natural",
    ],
    benefits: [
      "25g de proteína por porción",
      "Bajo en carbohidratos",
      "Rápida absorción",
      "Sabor delicioso",
    ],
    servingSize: "30g",
    servingsPerContainer: 33,
    // Nuevos campos extendidos
    bundles: [
      {
        id: "bundle-1",
        label: "Pack 1 unidad",
        quantity: 1,
        price: 24990,
        discount: 0,
        isRecommended: false,
        products: [
          {
            productId: "prod-1",
            variantId: "var-vainilla-1kg",
            quantity: 1,
          },
        ],
      },
      {
        id: "bundle-2",
        label: "Pack 2 unidades",
        quantity: 2,
        price: 44990, // 10% descuento
        discount: 10,
        perks: ["Envío gratis", "Ahorra $5.000"],
        isRecommended: false,
        products: [
          {
            productId: "prod-1",
            variantId: "var-vainilla-1kg",
            quantity: 2,
          },
        ],
      },
      {
        id: "bundle-3",
        label: "Pack 3 unidades",
        quantity: 3,
        price: 62990, // 15% descuento
        discount: 15,
        perks: ["Envío gratis", "Ahorra $12.000", "Regalo: Shaker incluido"],
        isRecommended: true,
        products: [
          {
            productId: "prod-1",
            variantId: "var-vainilla-1kg",
            quantity: 3,
          },
        ],
      },
    ],
    expertQuotes: [
      {
        id: "quote-1",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
        name: "Dr. María González",
        title: "Nutricionista Deportiva",
        text: "Esta proteína es excelente para la recuperación muscular post-entrenamiento. La recomiendo a mis pacientes.",
        credentials: "Magíster en Nutrición Deportiva, Universidad de Chile",
      },
      {
        id: "quote-2",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
        name: "Carlos Ramírez",
        title: "Entrenador Personal Certificado",
        text: "He visto resultados increíbles en mis clientes. La calidad es superior y el sabor es delicioso.",
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "¿Cómo debo tomar esta proteína?",
        answer: "Recomendamos tomar 1 porción (30g) mezclada con agua o leche después del entrenamiento. También puedes tomarla en cualquier momento del día como snack proteico.",
        category: "uso",
      },
      {
        id: "faq-2",
        question: "¿Cuándo veré resultados?",
        answer: "Los resultados varían según tu dieta y entrenamiento. Generalmente, con uso consistente y una dieta adecuada, puedes notar mejoras en la recuperación y ganancia muscular en 4-6 semanas.",
        category: "resultados",
      },
      {
        id: "faq-3",
        question: "¿Es segura para consumo diario?",
        answer: "Sí, esta proteína es completamente segura para consumo diario. Está certificada y cumple con todos los estándares de calidad. Sin embargo, siempre recomendamos consultar con un profesional de la salud si tienes condiciones médicas específicas.",
        category: "miedos",
      },
      {
        id: "faq-4",
        question: "¿Cuánto tarda el envío?",
        answer: "El envío estándar tarda 2-3 días hábiles en Santiago y 4-5 días hábiles en regiones. En compras sobre $50.000 el envío es gratis.",
        category: "logistica",
      },
      {
        id: "faq-5",
        question: "¿Tiene certificaciones?",
        answer: "Sí, nuestro producto está certificado por la FDA, tiene certificación GMP (Good Manufacturing Practices) y está libre de sustancias prohibidas. Todos nuestros lotes son analizados en laboratorios independientes.",
        category: "certificaciones",
      },
    ],
    educationBlocks: [
      {
        id: "edu-1",
        title: "¿Por qué proteína después del entrenamiento?",
        explanation: "<p>Después del entrenamiento, tus músculos están en un estado de descomposición. La proteína de suero de leche se absorbe rápidamente (en 30-60 minutos), proporcionando los aminoácidos necesarios para iniciar la síntesis de proteína muscular y acelerar la recuperación.</p><p>Estudios científicos demuestran que consumir proteína dentro de la ventana de 30-60 minutos post-entrenamiento puede mejorar significativamente la recuperación y el crecimiento muscular.</p>",
        visualSupport: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        order: 0,
      },
      {
        id: "edu-2",
        title: "Proteína de suero vs otras proteínas",
        explanation: "<p>La proteína de suero de leche (whey) es una de las proteínas más completas disponibles, con un perfil de aminoácidos excepcional y alta biodisponibilidad.</p><p>A diferencia de las proteínas vegetales, la whey contiene todos los aminoácidos esenciales en las proporciones correctas, lo que la hace ideal para la síntesis de proteína muscular.</p>",
        visualSupport: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        order: 1,
      },
    ],
    coreBenefits: [
      {
        id: "benefit-1",
        icon: "Award",
        title: "25g de proteína por porción",
        description: "Cantidad óptima para maximizar la síntesis de proteína muscular después del entrenamiento.",
      },
      {
        id: "benefit-2",
        icon: "Zap",
        title: "Absorción rápida",
        description: "Se absorbe en 30-60 minutos, ideal para la ventana anabólica post-entrenamiento.",
      },
      {
        id: "benefit-3",
        icon: "Heart",
        title: "Bajo en carbohidratos",
        description: "Perfecta para mantener tu dieta mientras obtienes la proteína que necesitas.",
      },
      {
        id: "benefit-4",
        icon: "Brain",
        title: "Sabor delicioso",
        description: "Fácil de tomar, no tendrás que forzarte a consumirla. Disfruta mientras te nutres.",
      },
    ],
    announcementConfig: {
      freeShippingThreshold: 50000,
      installments: "Hasta 12 cuotas sin interés",
      showInstallments: true,
      showFreeShipping: true,
    },
  },
  {
    id: "prod-2",
    handle: "whey-protein-chocolate",
    title: "Whey Protein Premium - Chocolate",
    description:
      "Proteína de suero de leche sabor chocolate intenso. Perfecta para batidos post-entrenamiento.",
    price: 24990,
    compareAtPrice: 29990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(24990, {
      option1: ["Chocolate", "Chocolate Blanco", "Chocolate con Maní"],
      option2: ["1kg", "2kg"],
    }),
    tags: ["proteina", "whey", "chocolate"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Proteína en Polvo",
    available: true,
    inventory: 32,
    rating: 4.9,
    reviewCount: 189,
    servingSize: "30g",
    servingsPerContainer: 33,
  },
  {
    id: "prod-3",
    handle: "casein-protein",
    title: "Casein Protein - Proteína de Liberación Lenta",
    description:
      "Proteína de caseína de liberación lenta. Ideal para tomar antes de dormir para recuperación durante la noche.",
    price: 27990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(27990, {
      option1: ["Vainilla", "Chocolate"],
      option2: ["1kg", "2kg"],
    }),
    tags: ["proteina", "casein", "noche", "liberacion-lenta"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Proteína en Polvo",
    available: true,
    inventory: 28,
    rating: 4.7,
    reviewCount: 156,
    servingSize: "35g",
    servingsPerContainer: 28,
  },
  {
    id: "prod-4",
    handle: "vegan-protein",
    title: "Proteína Vegana - Guisante y Arroz",
    description:
      "Proteína 100% vegetal combinando proteína de guisante y arroz. Sin lactosa, sin gluten, perfecta para veganos.",
    price: 29990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(29990, {
      option1: ["Natural", "Vainilla", "Chocolate"],
      option2: ["500g", "1kg"],
    }),
    tags: ["proteina", "vegana", "vegetal", "sin-lactosa"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Proteína en Polvo",
    available: true,
    inventory: 22,
    rating: 4.6,
    reviewCount: 98,
    servingSize: "30g",
    servingsPerContainer: 16,
  },
  {
    id: "prod-5",
    handle: "isolate-protein",
    title: "Whey Isolate - Máxima Pureza",
    description:
      "Proteína aislada con 90% de pureza. Baja en carbohidratos y grasas. Ideal para definición.",
    price: 34990,
    compareAtPrice: 39990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(34990, {
      option1: ["Vainilla", "Chocolate", "Fresa", "Cookies & Cream"],
      option2: ["1kg", "2kg"],
    }),
    tags: ["proteina", "isolate", "definicion", "bajo-carbohidratos"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Proteína en Polvo",
    available: true,
    inventory: 18,
    rating: 4.9,
    reviewCount: 267,
    servingSize: "30g",
    servingsPerContainer: 33,
  },
  {
    id: "prod-6",
    handle: "mass-gainer",
    title: "Mass Gainer - Ganador de Peso",
    description:
      "Suplemento completo con proteínas y carbohidratos para ganar peso y masa muscular de forma efectiva.",
    price: 31990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(31990, {
      option1: ["Vainilla", "Chocolate"],
      option2: ["3kg", "5kg"],
    }),
    tags: ["proteina", "mass-gainer", "ganar-peso", "carbohidratos"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Ganador de Peso",
    available: true,
    inventory: 15,
    rating: 4.5,
    reviewCount: 142,
    servingSize: "150g",
    servingsPerContainer: 20,
  },
  {
    id: "prod-7",
    handle: "protein-bar",
    title: "Barra de Proteína - 20g Proteína",
    description:
      "Barra de proteína deliciosa con 20g de proteína. Perfecta como snack saludable o post-entrenamiento.",
    price: 2990,
    compareAtPrice: 3490,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(2990, {
      option1: ["Chocolate", "Vainilla", "Fresa", "Cookies & Cream"],
    }),
    tags: ["proteina", "barra", "snack", "portatil"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Barra de Proteína",
    available: true,
    inventory: 120,
    rating: 4.7,
    reviewCount: 89,
    servingSize: "60g",
    servingsPerContainer: 1,
  },
  {
    id: "prod-8",
    handle: "protein-pancake-mix",
    title: "Mezcla para Pancakes Proteicos",
    description:
      "Mezcla lista para preparar pancakes ricos en proteína. Solo agrega agua y listo.",
    price: 12990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(12990, {
      option1: ["Vainilla", "Chocolate"],
    }),
    tags: ["proteina", "pancakes", "desayuno", "receta"],
    category: "cat-1",
    categoryName: "Proteínas",
    vendor: "ElkiFit",
    type: "Mezcla para Pancakes",
    available: true,
    inventory: 35,
    rating: 4.6,
    reviewCount: 67,
    servingSize: "50g",
    servingsPerContainer: 20,
  },

  // CREATINA
  {
    id: "prod-9",
    handle: "creatine-monohydrate",
    title: "Creatina Monohidrato - 99% Pura",
    description:
      "Creatina monohidrato de máxima pureza. Mejora la fuerza, potencia y recuperación muscular.",
    price: 12990,
    compareAtPrice: 15990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(12990, {
      option1: ["Sin sabor", "Frutas", "Limonada"],
      option2: ["300g", "500g", "1kg"],
    }),
    tags: ["creatina", "fuerza", "potencia", "recuperacion"],
    category: "cat-2",
    categoryName: "Creatina",
    vendor: "ElkiFit",
    type: "Creatina",
    available: true,
    inventory: 42,
    rating: 4.8,
    reviewCount: 312,
    servingSize: "5g",
    servingsPerContainer: 60,
  },
  {
    id: "prod-10",
    handle: "creatine-hcl",
    title: "Creatina HCL - Mayor Absorción",
    description:
      "Creatina hidrocloruro con mejor solubilidad y absorción. Sin carga de creatina necesaria.",
    price: 18990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(18990, {
      option1: ["Sin sabor", "Frutas"],
      option2: ["250g", "500g"],
    }),
    tags: ["creatina", "hcl", "absorcion", "sin-carga"],
    category: "cat-2",
    categoryName: "Creatina",
    vendor: "ElkiFit",
    type: "Creatina",
    available: true,
    inventory: 28,
    rating: 4.7,
    reviewCount: 145,
    servingSize: "2.5g",
    servingsPerContainer: 100,
  },
  {
    id: "prod-11",
    handle: "creatine-micronized",
    title: "Creatina Micronizada - Máxima Pureza",
    description:
      "Creatina micronizada de partículas ultra finas para mejor disolución y absorción.",
    price: 14990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(14990, {
      option1: ["Sin sabor"],
      option2: ["300g", "500g"],
    }),
    tags: ["creatina", "micronizada", "pureza"],
    category: "cat-2",
    categoryName: "Creatina",
    vendor: "ElkiFit",
    type: "Creatina",
    available: true,
    inventory: 31,
    rating: 4.6,
    reviewCount: 98,
    servingSize: "5g",
    servingsPerContainer: 60,
  },
  {
    id: "prod-12",
    handle: "creatine-complex",
    title: "Creatina Complex - Con Beta Alanina",
    description:
      "Complejo de creatina con beta alanina para máximo rendimiento y resistencia.",
    price: 21990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(21990, {
      option1: ["Frutas", "Limonada"],
      option2: ["400g", "800g"],
    }),
    tags: ["creatina", "beta-alanina", "resistencia", "complejo"],
    category: "cat-2",
    categoryName: "Creatina",
    vendor: "ElkiFit",
    type: "Creatina",
    available: true,
    inventory: 19,
    rating: 4.9,
    reviewCount: 201,
    servingSize: "10g",
    servingsPerContainer: 40,
  },

  // PRE-WORKOUT
  {
    id: "prod-13",
    handle: "pre-workout-intense",
    title: "Pre-Workout Intense - Máxima Energía",
    description:
      "Pre-entrenamiento con cafeína, beta alanina y citrulina. Energía y resistencia para entrenamientos intensos.",
    price: 24990,
    compareAtPrice: 29990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(24990, {
      option1: ["Frutas Tropicales", "Limonada", "Sandía", "Uva"],
      option2: ["300g", "500g"],
    }),
    tags: ["pre-workout", "energia", "cafeina", "resistencia"],
    category: "cat-3",
    categoryName: "Pre-Workout",
    vendor: "ElkiFit",
    type: "Pre-Entrenamiento",
    available: true,
    inventory: 38,
    rating: 4.8,
    reviewCount: 423,
    servingSize: "15g",
    servingsPerContainer: 20,
  },
  {
    id: "prod-14",
    handle: "pre-workout-stim-free",
    title: "Pre-Workout Sin Estimulantes",
    description:
      "Pre-entrenamiento sin cafeína. Perfecto para entrenamientos nocturnos o personas sensibles a estimulantes.",
    price: 22990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(22990, {
      option1: ["Frutas", "Limonada"],
      option2: ["300g", "500g"],
    }),
    tags: ["pre-workout", "sin-cafeina", "nocturno", "estimulantes"],
    category: "cat-3",
    categoryName: "Pre-Workout",
    vendor: "ElkiFit",
    type: "Pre-Entrenamiento",
    available: true,
    inventory: 25,
    rating: 4.6,
    reviewCount: 167,
    servingSize: "15g",
    servingsPerContainer: 20,
  },
  {
    id: "prod-15",
    handle: "pre-workout-pump",
    title: "Pre-Workout Pump - Bomba Muscular",
    description:
      "Fórmula diseñada para máximo bombeo muscular con óxido nítrico y citrulina malato.",
    price: 21990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(21990, {
      option1: ["Frutas", "Limonada", "Sandía"],
      option2: ["300g"],
    }),
    tags: ["pre-workout", "pump", "oxido-nitrico", "bomba"],
    category: "cat-3",
    categoryName: "Pre-Workout",
    vendor: "ElkiFit",
    type: "Pre-Entrenamiento",
    available: true,
    inventory: 29,
    rating: 4.7,
    reviewCount: 198,
    servingSize: "15g",
    servingsPerContainer: 20,
  },
  {
    id: "prod-16",
    handle: "pre-workout-capsules",
    title: "Pre-Workout en Cápsulas",
    description:
      "Pre-entrenamiento en formato de cápsulas. Fácil de tomar, sin necesidad de mezclar.",
    price: 18990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(18990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["pre-workout", "capsulas", "portatil", "facil"],
    category: "cat-3",
    categoryName: "Pre-Workout",
    vendor: "ElkiFit",
    type: "Pre-Entrenamiento",
    available: true,
    inventory: 44,
    rating: 4.5,
    reviewCount: 134,
    servingSize: "2 cápsulas",
    servingsPerContainer: 30,
  },
  {
    id: "prod-17",
    handle: "pre-workout-natural",
    title: "Pre-Workout Natural - Sin Químicos",
    description:
      "Pre-entrenamiento 100% natural con extractos de plantas y frutas. Sin químicos artificiales.",
    price: 26990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(26990, {
      option1: ["Frutas", "Verde"],
      option2: ["300g"],
    }),
    tags: ["pre-workout", "natural", "organico", "sin-quimicos"],
    category: "cat-3",
    categoryName: "Pre-Workout",
    vendor: "ElkiFit",
    type: "Pre-Entrenamiento",
    available: true,
    inventory: 21,
    rating: 4.8,
    reviewCount: 156,
    servingSize: "15g",
    servingsPerContainer: 20,
  },

  // VITAMINAS
  {
    id: "prod-18",
    handle: "multivitamin-complete",
    title: "Multivitamínico Completo - 60 Vitaminas",
    description:
      "Multivitamínico completo con 60 vitaminas y minerales esenciales. Soporte nutricional diario.",
    price: 14990,
    compareAtPrice: 18990,
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop",
    ],
    variants: createVariants(14990, {
      option1: ["60 tabletas", "120 tabletas"],
    }),
    tags: ["vitaminas", "multivitaminico", "minerales", "diario"],
    category: "cat-4",
    categoryName: "Vitaminas",
    vendor: "ElkiFit",
    type: "Multivitamínico",
    available: true,
    inventory: 67,
    rating: 4.7,
    reviewCount: 289,
    servingSize: "1 tableta",
    servingsPerContainer: 60,
  },
  {
    id: "prod-19",
    handle: "vitamin-d3",
    title: "Vitamina D3 - 2000 UI",
    description:
      "Vitamina D3 de alta potencia. Esencial para huesos, sistema inmune y bienestar general.",
    price: 8990,
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop",
    ],
    variants: createVariants(8990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["vitaminas", "vitamina-d", "huesos", "inmune"],
    category: "cat-4",
    categoryName: "Vitaminas",
    vendor: "ElkiFit",
    type: "Vitamina D",
    available: true,
    inventory: 89,
    rating: 4.9,
    reviewCount: 412,
    servingSize: "1 cápsula",
    servingsPerContainer: 60,
  },
  {
    id: "prod-20",
    handle: "vitamin-c",
    title: "Vitamina C - 1000mg",
    description:
      "Vitamina C de alta potencia para sistema inmune y antioxidante. Liberación prolongada.",
    price: 7990,
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop",
    ],
    variants: createVariants(7990, {
      option1: ["60 tabletas", "120 tabletas"],
    }),
    tags: ["vitaminas", "vitamina-c", "inmune", "antioxidante"],
    category: "cat-4",
    categoryName: "Vitaminas",
    vendor: "ElkiFit",
    type: "Vitamina C",
    available: true,
    inventory: 76,
    rating: 4.8,
    reviewCount: 334,
    servingSize: "1 tableta",
    servingsPerContainer: 60,
  },
  {
    id: "prod-21",
    handle: "omega-3",
    title: "Omega 3 - Aceite de Pescado",
    description:
      "Ácidos grasos Omega 3 de alta calidad. Beneficios para corazón, cerebro y articulaciones.",
    price: 12990,
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop",
    ],
    variants: createVariants(12990, {
      option1: ["60 cápsulas", "120 cápsulas", "180 cápsulas"],
    }),
    tags: ["vitaminas", "omega-3", "corazon", "cerebro"],
    category: "cat-4",
    categoryName: "Vitaminas",
    vendor: "ElkiFit",
    type: "Omega 3",
    available: true,
    inventory: 54,
    rating: 4.7,
    reviewCount: 256,
    servingSize: "2 cápsulas",
    servingsPerContainer: 30,
  },
  {
    id: "prod-22",
    handle: "vitamin-b-complex",
    title: "Complejo de Vitaminas B",
    description:
      "Complejo completo de vitaminas B para energía, metabolismo y función nerviosa.",
    price: 10990,
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop",
    ],
    variants: createVariants(10990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["vitaminas", "vitamina-b", "energia", "metabolismo"],
    category: "cat-4",
    categoryName: "Vitaminas",
    vendor: "ElkiFit",
    type: "Vitamina B",
    available: true,
    inventory: 41,
    rating: 4.6,
    reviewCount: 178,
    servingSize: "1 cápsula",
    servingsPerContainer: 60,
  },
  {
    id: "prod-23",
    handle: "zinc-magnesium",
    title: "Zinc + Magnesio - ZMA",
    description:
      "Combinación de zinc y magnesio para recuperación, sueño y testosterona natural.",
    price: 11990,
    images: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop",
    ],
    variants: createVariants(11990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["vitaminas", "zinc", "magnesio", "recuperacion", "sueño"],
    category: "cat-4",
    categoryName: "Vitaminas",
    vendor: "ElkiFit",
    type: "ZMA",
    available: true,
    inventory: 33,
    rating: 4.8,
    reviewCount: 223,
    servingSize: "3 cápsulas",
    servingsPerContainer: 20,
  },

  // QUEMADORES
  {
    id: "prod-24",
    handle: "fat-burner-intense",
    title: "Quemador de Grasa Intenso",
    description:
      "Fórmula termogénica avanzada para acelerar el metabolismo y quemar grasa de forma efectiva.",
    price: 24990,
    compareAtPrice: 29990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(24990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["quemador", "grasa", "termogenico", "metabolismo"],
    category: "cat-5",
    categoryName: "Quemadores",
    vendor: "ElkiFit",
    type: "Quemador de Grasa",
    available: true,
    inventory: 27,
    rating: 4.7,
    reviewCount: 345,
    servingSize: "2 cápsulas",
    servingsPerContainer: 30,
  },
  {
    id: "prod-25",
    handle: "fat-burner-natural",
    title: "Quemador de Grasa Natural",
    description:
      "Quemador de grasa con ingredientes 100% naturales. Sin estimulantes artificiales.",
    price: 21990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(21990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["quemador", "grasa", "natural", "sin-estimulantes"],
    category: "cat-5",
    categoryName: "Quemadores",
    vendor: "ElkiFit",
    type: "Quemador de Grasa",
    available: true,
    inventory: 19,
    rating: 4.6,
    reviewCount: 198,
    servingSize: "2 cápsulas",
    servingsPerContainer: 30,
  },
  {
    id: "prod-26",
    handle: "l-carnitine",
    title: "L-Carnitina - Transportador de Grasa",
    description:
      "L-Carnitina para transportar grasa a las mitocondrias y convertirla en energía.",
    price: 14990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(14990, {
      option1: ["Líquido", "Cápsulas"],
      option2: ["500ml", "60 cápsulas"],
    }),
    tags: ["quemador", "l-carnitina", "energia", "grasa"],
    category: "cat-5",
    categoryName: "Quemadores",
    vendor: "ElkiFit",
    type: "L-Carnitina",
    available: true,
    inventory: 36,
    rating: 4.5,
    reviewCount: 167,
    servingSize: "1 dosis",
    servingsPerContainer: 30,
  },
  {
    id: "prod-27",
    handle: "green-tea-extract",
    title: "Extracto de Té Verde - EGCG",
    description:
      "Extracto de té verde con alto contenido de EGCG. Antioxidante y apoyo para pérdida de peso.",
    price: 9990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(9990, {
      option1: ["60 cápsulas", "120 cápsulas"],
    }),
    tags: ["quemador", "te-verde", "antioxidante", "egcg"],
    category: "cat-5",
    categoryName: "Quemadores",
    vendor: "ElkiFit",
    type: "Extracto de Té Verde",
    available: true,
    inventory: 48,
    rating: 4.6,
    reviewCount: 134,
    servingSize: "1 cápsula",
    servingsPerContainer: 60,
  },

  // AMINOÁCIDOS
  {
    id: "prod-28",
    handle: "bcaa-ratio-2-1-1",
    title: "BCAA 2:1:1 - Aminoácidos Ramificados",
    description:
      "BCAA en ratio 2:1:1 (Leucina:Isoleucina:Valina) para recuperación y prevención de catabolismo.",
    price: 14990,
    compareAtPrice: 17990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(14990, {
      option1: ["Frutas", "Limonada", "Sandía"],
      option2: ["300g", "500g"],
    }),
    tags: ["aminoacidos", "bcaa", "recuperacion", "catabolismo"],
    category: "cat-6",
    categoryName: "Aminoácidos",
    vendor: "ElkiFit",
    type: "BCAA",
    available: true,
    inventory: 52,
    rating: 4.8,
    reviewCount: 278,
    servingSize: "10g",
    servingsPerContainer: 30,
  },
  {
    id: "prod-29",
    handle: "eaa-complete",
    title: "EAA Completo - 9 Aminoácidos Esenciales",
    description:
      "Completo de 9 aminoácidos esenciales. Más completo que BCAA para máxima recuperación.",
    price: 18990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(18990, {
      option1: ["Frutas", "Limonada"],
      option2: ["300g", "500g"],
    }),
    tags: ["aminoacidos", "eaa", "esenciales", "recuperacion"],
    category: "cat-6",
    categoryName: "Aminoácidos",
    vendor: "ElkiFit",
    type: "EAA",
    available: true,
    inventory: 29,
    rating: 4.7,
    reviewCount: 189,
    servingSize: "12g",
    servingsPerContainer: 25,
  },
  {
    id: "prod-30",
    handle: "glutamine",
    title: "Glutamina - Recuperación Muscular",
    description:
      "Glutamina pura para recuperación muscular, sistema inmune y salud intestinal.",
    price: 12990,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
    ],
    variants: createVariants(12990, {
      option1: ["Sin sabor"],
      option2: ["300g", "500g"],
    }),
    tags: ["aminoacidos", "glutamina", "recuperacion", "inmune"],
    category: "cat-6",
    categoryName: "Aminoácidos",
    vendor: "ElkiFit",
    type: "Glutamina",
    available: true,
    inventory: 37,
    rating: 4.6,
    reviewCount: 145,
    servingSize: "5g",
    servingsPerContainer: 60,
  },
];

// Helper functions para obtener datos
export const getProductByHandle = (handle: string): ExtendedProduct | undefined => {
  return products.find((p) => p.handle === handle);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter((p) => p.category === categoryId);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((c) => c.slug === slug);
};

export const getAllProducts = (): Product[] => {
  return products;
};

export const getAllCategories = (): Category[] => {
  return categories;
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      p.vendor?.toLowerCase().includes(lowerQuery)
  );
};

// Reviews mock data para productos
export const reviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userId: "user-1",
    userName: "María González",
    rating: 5,
    title: "Excelente producto, muy recomendado",
    comment: "Llevo 2 meses tomando esta proteína y he notado una mejora significativa en mi recuperación post-entrenamiento. El sabor es delicioso y se disuelve perfectamente. Definitivamente la recomiendo.",
    images: [
      {
        id: "img-rev-1-1",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        alt: "Proteína en uso - María González",
      },
      {
        id: "img-rev-1-2",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
        alt: "Resultados después de 2 meses",
      },
    ],
    verified: true,
    helpful: 23,
    helpfulUsers: [],
    createdAt: "2024-01-15T10:30:00Z",
    status: "approved",
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userId: "user-2",
    userName: "Carlos Ramírez",
    rating: 5,
    title: "Mejor proteína que he probado",
    comment: "Como entrenador personal, he probado muchas proteínas y esta es definitivamente una de las mejores. La calidad es superior, el sabor es increíble y mis clientes están muy contentos con los resultados.",
    images: [
      {
        id: "img-rev-2-1",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format",
        alt: "Proteína en el gimnasio",
      },
    ],
    verified: true,
    helpful: 18,
    helpfulUsers: [],
    createdAt: "2024-01-20T14:15:00Z",
    status: "approved",
  },
  {
    id: "rev-3",
    productId: "prod-1",
    userId: "user-3",
    userName: "Ana Martínez",
    rating: 4,
    title: "Muy buena, pero el sabor podría mejorar",
    comment: "La proteína funciona muy bien, he notado mejor recuperación. El único punto es que el sabor de vainilla es un poco artificial, pero es tolerable. La recomiendo por la calidad.",
    images: [
      {
        id: "img-rev-3-1",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80&auto=format",
        alt: "Proteína en batido",
      },
    ],
    verified: true,
    helpful: 12,
    helpfulUsers: [],
    createdAt: "2024-01-25T09:45:00Z",
    status: "approved",
  },
  {
    id: "rev-4",
    productId: "prod-1",
    userId: "user-4",
    userName: "Roberto Silva",
    rating: 5,
    title: "Increíble, superó mis expectativas",
    comment: "Después de 3 meses de uso, puedo decir que esta proteína es excelente. He ganado masa muscular de forma consistente y la recuperación es mucho mejor. El precio es justo para la calidad que ofrece.",
    images: [
      {
        id: "img-rev-4-1",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&dpr=2",
        alt: "Transformación después de 3 meses",
      },
      {
        id: "img-rev-4-2",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
        alt: "Proteína en diferentes momentos del día",
      },
    ],
    verified: true,
    helpful: 31,
    helpfulUsers: [],
    createdAt: "2024-02-01T16:20:00Z",
    status: "approved",
  },
  {
    id: "rev-5",
    productId: "prod-1",
    userId: "user-5",
    userName: "Laura Fernández",
    rating: 5,
    title: "Perfecta para mi rutina",
    comment: "Como mujer que entrena regularmente, esta proteína ha sido perfecta. No me causa problemas digestivos, el sabor es suave y los resultados son visibles. Muy contenta con la compra.",
    images: [
      {
        id: "img-rev-5-1",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&dpr=2",
        alt: "Proteína en mi rutina diaria",
      },
    ],
    verified: true,
    helpful: 15,
    helpfulUsers: [],
    createdAt: "2024-02-05T11:30:00Z",
    status: "approved",
  },
  {
    id: "rev-6",
    productId: "prod-1",
    userId: "user-6",
    userName: "Diego Morales",
    rating: 4,
    title: "Buena relación calidad-precio",
    comment: "La proteína cumple con lo prometido. Buena calidad, buen sabor y precio razonable. La única razón por la que no le doy 5 estrellas es porque esperaba un poco más de sabor, pero en general estoy satisfecho.",
    images: [],
    verified: true,
    helpful: 8,
    helpfulUsers: [],
    createdAt: "2024-02-10T13:45:00Z",
    status: "approved",
  },
  {
    id: "rev-7",
    productId: "prod-1",
    userId: "user-7",
    userName: "Patricia López",
    rating: 5,
    title: "Excelente para ganar masa",
    comment: "He estado tomando esta proteína durante mi fase de volumen y los resultados son increíbles. He ganado 5kg de masa muscular en 4 meses. El sabor es delicioso y se mezcla perfectamente.",
    images: [
      {
        id: "img-rev-7-1",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
        alt: "Progreso de 4 meses",
      },
    ],
    verified: true,
    helpful: 27,
    helpfulUsers: [],
    createdAt: "2024-02-12T10:00:00Z",
    status: "approved",
  },
];

// Helper function para obtener reviews de un producto
export const getReviewsByProductId = (productId: string): Review[] => {
  return reviews.filter((r) => r.productId === productId);
};

