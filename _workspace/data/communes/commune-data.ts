export interface CommuneData {
  name: string;
  description: string;
  highlights: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  amenities: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  mapPins: Array<{
    type: string;
    label: string;
    coordinates: string;
    color: string;
  }>;
}

export const communeData: Record<string, CommuneData> = {
  "Estación Central": {
    name: "Estación Central",
    description: "Una comuna vibrante y moderna que combina la tranquilidad residencial con la conveniencia urbana. Conectada por múltiples líneas de metro y rodeada de parques, ofrece una calidad de vida excepcional para familias y profesionales.",
    highlights: [
      { icon: "Train", label: "3 líneas de metro", value: "Estación Central, Universidad de Chile, Los Héroes" },
      { icon: "Tree", label: "Parques cercanos", value: "Parque O'Higgins, Parque Forestal, Cerro Santa Lucía" },
      { icon: "ShoppingBag", label: "Centros comerciales", value: "Costanera Center, Parque Arauco, Alto Las Condes" },
      { icon: "Coffee", label: "Cafés y restaurantes", value: "Más de 200 opciones gastronómicas" }
    ],
    amenities: [
      { icon: "Star", label: "Seguridad", value: "Policía local 24/7, vigilancia privada" },
      { icon: "Users", label: "Comunidad", value: "Actividades culturales, eventos deportivos" },
      { icon: "Car", label: "Transporte", value: "Metro, buses, ciclovías, estacionamientos" }
    ],
    mapPins: [
      { type: "metro", label: "Estación Metro", coordinates: "center", color: "blue" },
      { type: "park", label: "Parque O'Higgins", coordinates: "top-right", color: "green" },
      { type: "services", label: "Centro Comercial", coordinates: "bottom-left", color: "orange" }
    ]
  },
  "Las Condes": {
    name: "Las Condes",
    description: "Comuna de alto nivel con excelente conectividad y servicios premium. Ubicada en el sector oriente de Santiago, ofrece un estilo de vida sofisticado con acceso a las mejores amenidades de la ciudad.",
    highlights: [
      { icon: "Train", label: "Metro directo", value: "Línea 1: Tobalaba, Los Dominicos" },
      { icon: "Tree", label: "Áreas verdes", value: "Parque Araucano, Parque Bicentenario, Cerro San Cristóbal" },
      { icon: "ShoppingBag", label: "Shopping premium", value: "Alto Las Condes, Parque Arauco, Costanera Center" },
      { icon: "Coffee", label: "Gastronomía", value: "Restaurantes gourmet, cafés boutique" }
    ],
    amenities: [
      { icon: "Star", label: "Seguridad", value: "Vigilancia 24/7, seguridad privada premium" },
      { icon: "Users", label: "Comunidad", value: "Clubes deportivos, centros culturales exclusivos" },
      { icon: "Car", label: "Transporte", value: "Metro, buses premium, estacionamientos seguros" }
    ],
    mapPins: [
      { type: "metro", label: "Tobalaba", coordinates: "center", color: "blue" },
      { type: "park", label: "Parque Araucano", coordinates: "top-right", color: "green" },
      { type: "services", label: "Alto Las Condes", coordinates: "bottom-left", color: "orange" }
    ]
  },
  "Providencia": {
    name: "Providencia",
    description: "Comuna céntrica y dinámica que combina la tradición con la modernidad. Conocida por su vida cultural activa, excelente conectividad y diversidad de opciones de entretenimiento.",
    highlights: [
      { icon: "Train", label: "Metro estratégico", value: "Líneas 1 y 5: Baquedano, Universidad Católica" },
      { icon: "Tree", label: "Parques urbanos", value: "Parque Balmaceda, Parque Bustamante, Cerro San Cristóbal" },
      { icon: "ShoppingBag", label: "Comercio local", value: "Av. Providencia, Costanera Center, Mall Costanera" },
      { icon: "Coffee", label: "Vida nocturna", value: "Bares, restaurantes, teatros y cines" }
    ],
    amenities: [
      { icon: "Star", label: "Seguridad", value: "Policía local, vigilancia comunal" },
      { icon: "Users", label: "Cultura", value: "Teatros, museos, centros culturales" },
      { icon: "Car", label: "Transporte", value: "Metro, buses, ciclovías, estacionamientos" }
    ],
    mapPins: [
      { type: "metro", label: "Baquedano", coordinates: "center", color: "blue" },
      { type: "park", label: "Parque Balmaceda", coordinates: "top-right", color: "green" },
      { type: "services", label: "Costanera Center", coordinates: "bottom-left", color: "orange" }
    ]
  }
};

export function getCommuneData(communeName: string): CommuneData {
  return communeData[communeName] || communeData["Estación Central"];
}









