"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ImageGallery } from "@components/gallery/ImageGallery";
import { PromotionBadge } from "@components/ui/PromotionBadge";
import { CommuneLifeSection } from "@components/commune/CommuneLifeSection";
import { getFlagValue } from "@lib/flags";
import { ArrowLeft, MapPin, Users, Home, Sparkles, ExternalLink, Calendar, MessageCircle, Clock, Star, CheckCircle, Zap, TrendingUp, Eye, Wifi, Car, Dumbbell, Waves, Shield, Coffee, WashingMachine, AirVent, ParkingCircle, TreePine, Camera, Lock, Wrench, ChevronLeft, ChevronRight, Building2, Bed, Bath, Sofa, Utensils, Baby, Dog, Bike, Percent, CreditCard, Heart, Award, Gift, Tag, DollarSign, ShoppingCart, CalendarDays, Gamepad2, Tv, Music, BookOpen, Palette, Globe, Phone, Mail, Smartphone, Monitor, Printer, Projector, Headphones, Speaker, Lightbulb, Fan, Thermometer, Snowflake, Sun, Moon, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, Umbrella, ChevronUp, ChevronDown, Key, Bell, Flame, Droplets, Trash2, Layers, Pill, Cat, Video, Image as ImageIcon, Leaf } from "lucide-react";

// Función local para obtener el badge principal
function getPrimaryBadge(badges?: Array<{ label: string; tag?: string; type: string }>) {
  if (!badges || badges.length === 0) return null;
  return badges[0];
}

// Función para obtener colores sobrios y consistentes
const getBadgeColor = (label: string) => {
  const labelLower = label.toLowerCase();

  // Solo destacar lo más importante con colores llamativos
  if (labelLower.includes('off') || labelLower.includes('%') || labelLower.includes('descuento')) {
    return "bg-orange-500 text-white border-orange-400 hover:bg-orange-600 shadow-lg";
  }
  if (labelLower.includes('sin comisión') || labelLower.includes('comisión gratis')) {
    return "bg-green-500 text-white border-green-400 hover:bg-green-600 shadow-lg";
  }

  // El resto en un color unificado pero destacado
  return "bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-md";
};

// Función para acortar texto de badges y mantener armonía visual
const getShortBadgeText = (label: string) => {
  const labelLower = label.toLowerCase();

  if (labelLower.includes('precio fijo 12 meses')) {
    return "Precio fijo";
  }
  if (labelLower.includes('garantía en cuotas')) {
    return "Garantía";
  }
  if (labelLower.includes('opción sin garantía')) {
    return "Sin garantía";
  }
  if (labelLower.includes('sin comisión') || labelLower.includes('comisión gratis')) {
    return "Sin comisión";
  }
  if (labelLower.includes('sin aval')) {
    return "Sin aval";
  }
  if (labelLower.includes('off') || labelLower.includes('%')) {
    return label; // Mantener descuentos como están
  }

  return label; // Mantener otros textos como están
};

// Función para obtener icono de badge de promoción
const getBadgeIcon = (label: string) => {
  const labelLower = label.toLowerCase();

  if (labelLower.includes('sin comisión') || labelLower.includes('comisión gratis')) {
    return DollarSign;
  }
  if (labelLower.includes('garantía en cuotas')) {
    return CreditCard;
  }
  if (labelLower.includes('opción sin garantía')) {
    return Heart;
  }
  if (labelLower.includes('precio fijo') || labelLower.includes('12 meses')) {
    return Award;
  }
  if (labelLower.includes('cuotas')) {
    return CalendarDays;
  }
  if (labelLower.includes('sin aval')) {
    return Gift;
  }
  if (labelLower.includes('off') || labelLower.includes('%')) {
    return Percent;
  }
  if (labelLower.includes('descuento')) {
    return Tag;
  }
  if (labelLower.includes('especial')) {
    return Star;
  }
  if (labelLower.includes('nuevo')) {
    return Sparkles;
  }

  return Sparkles; // Icono por defecto
};

// Función para obtener icono de amenidad
const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();

  // Comunicación y Tecnología
  if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
  if (amenityLower.includes('cito') || amenityLower.includes('citófono') || amenityLower.includes('citefono') || amenityLower.includes('intercom') || amenityLower.includes('interfono')) return Phone;
  if (amenityLower.includes('teléfono') || amenityLower.includes('phone')) return Phone;
  if (amenityLower.includes('tv') || amenityLower.includes('televisión') || amenityLower.includes('cable')) return Tv;
  if (amenityLower.includes('smartphone') || amenityLower.includes('celular')) return Smartphone;
  if (amenityLower.includes('monitor') || amenityLower.includes('pantalla')) return Monitor;
  if (amenityLower.includes('impresora') || amenityLower.includes('printer')) return Printer;
  if (amenityLower.includes('proyector') || amenityLower.includes('projector')) return Projector;
  if (amenityLower.includes('audífonos') || amenityLower.includes('headphones')) return Headphones;
  if (amenityLower.includes('altavoces') || amenityLower.includes('speaker')) return Speaker;
  if (amenityLower.includes('música') || amenityLower.includes('music')) return Music;

  // Transporte y Acceso
  if (amenityLower.includes('estacionamiento') || amenityLower.includes('parking')) return Car;
  if (amenityLower.includes('bicicletas') || amenityLower.includes('bike')) return Bike;
  if (amenityLower.includes('ascensor') || amenityLower.includes('elevator')) return ChevronUp;
  if (amenityLower.includes('escalera') || amenityLower.includes('stairs')) return ChevronDown;

  // Deportes y Recreación
  if (amenityLower.includes('gimnasio') || amenityLower.includes('gym')) return Dumbbell;
  if (amenityLower.includes('piscina') || amenityLower.includes('pool')) return Waves;
  if (amenityLower.includes('sauna') || amenityLower.includes('spa')) return Thermometer;
  if (amenityLower.includes('juegos') || amenityLower.includes('games')) return Gamepad2;
  if (amenityLower.includes('tenis') || amenityLower.includes('deportes')) return Dumbbell;
  if (amenityLower.includes('yoga') || amenityLower.includes('meditación')) return Heart;

  // Seguridad y Control
  if (amenityLower.includes('seguridad') || amenityLower.includes('security')) return Shield;
  if (amenityLower.includes('cctv') || amenityLower.includes('cámara') || amenityLower.includes('camera')) return Camera;
  if (amenityLower.includes('portero') || amenityLower.includes('doorman') || amenityLower.includes('concierge')) return Lock;
  if (amenityLower.includes('control de acceso') || amenityLower.includes('access control')) return Key;
  if (amenityLower.includes('alarma') || amenityLower.includes('alarm')) return Bell;

  // Servicios Básicos
  if (amenityLower.includes('aire acondicionado') || amenityLower.includes('ac') || amenityLower.includes('clima')) return AirVent;
  if (amenityLower.includes('calefacción') || amenityLower.includes('heating')) return Thermometer;
  if (amenityLower.includes('luz') || amenityLower.includes('light')) return Lightbulb;
  if (amenityLower.includes('ventilador') || amenityLower.includes('fan')) return Fan;
  if (amenityLower.includes('agua') || amenityLower.includes('water')) return Droplets;
  if (amenityLower.includes('gas') || amenityLower.includes('gas')) return Flame;

  // Limpieza y Mantenimiento
  if (amenityLower.includes('lavandería') || amenityLower.includes('laundry')) return WashingMachine;
  if (amenityLower.includes('mantenimiento')) return Wrench;
  if (amenityLower.includes('limpieza') || amenityLower.includes('cleaning')) return Sparkles;
  if (amenityLower.includes('basura') || amenityLower.includes('trash')) return Trash2;

  // Alimentación y Comercio
  if (amenityLower.includes('café') || amenityLower.includes('cafe')) return Coffee;
  if (amenityLower.includes('restaurante') || amenityLower.includes('restaurant')) return Utensils;
  if (amenityLower.includes('supermercado') || amenityLower.includes('supermarket')) return ShoppingCart;
  if (amenityLower.includes('farmacia') || amenityLower.includes('pharmacy')) return Pill;

  // Espacios Comunes
  if (amenityLower.includes('parque') || amenityLower.includes('garden') || amenityLower.includes('jardín')) return TreePine;
  if (amenityLower.includes('terraza') || amenityLower.includes('terrace') || amenityLower.includes('balcón')) return Sun;
  if (amenityLower.includes('quincho') || amenityLower.includes('barbecue') || amenityLower.includes('asado')) return Flame;
  if (amenityLower.includes('sala de eventos') || amenityLower.includes('event room')) return Users;
  if (amenityLower.includes('biblioteca') || amenityLower.includes('library')) return BookOpen;
  if (amenityLower.includes('sala de estudio') || amenityLower.includes('study room')) return BookOpen;
  if (amenityLower.includes('sala de reuniones') || amenityLower.includes('meeting room')) return Users;

  // Habitaciones
  if (amenityLower.includes('dormitorio') || amenityLower.includes('bedroom')) return Bed;
  if (amenityLower.includes('baño') || amenityLower.includes('bathroom')) return Bath;
  if (amenityLower.includes('sala') || amenityLower.includes('living')) return Sofa;
  if (amenityLower.includes('cocina') || amenityLower.includes('kitchen')) return Utensils;
  if (amenityLower.includes('comedor') || amenityLower.includes('dining')) return Utensils;
  if (amenityLower.includes('oficina') || amenityLower.includes('office')) return Building2;

  // Mascotas y Familia
  if (amenityLower.includes('niños') || amenityLower.includes('kids') || amenityLower.includes('children')) return Baby;
  if (amenityLower.includes('mascotas') || amenityLower.includes('pet') || amenityLower.includes('perros')) return Dog;
  if (amenityLower.includes('gatos') || amenityLower.includes('cats')) return Cat;

  // Arte y Cultura
  if (amenityLower.includes('arte') || amenityLower.includes('art')) return Palette;
  if (amenityLower.includes('galería') || amenityLower.includes('gallery')) return ImageIcon;
  if (amenityLower.includes('teatro') || amenityLower.includes('theater')) return Video;

  // Negocios y Trabajo
  if (amenityLower.includes('coworking') || amenityLower.includes('espacio de trabajo')) return Building2;
  if (amenityLower.includes('internacional') || amenityLower.includes('international')) return Globe;
  if (amenityLower.includes('email') || amenityLower.includes('mail')) return Mail;

  // Clima y Ambiente
  if (amenityLower.includes('temperatura') || amenityLower.includes('thermometer')) return Thermometer;
  if (amenityLower.includes('clima') || amenityLower.includes('weather')) return Cloud;
  if (amenityLower.includes('lluvia') || amenityLower.includes('rain')) return CloudRain;
  if (amenityLower.includes('nieve') || amenityLower.includes('snow')) return CloudSnow;
  if (amenityLower.includes('viento') || amenityLower.includes('wind')) return Wind;
  if (amenityLower.includes('sol') || amenityLower.includes('sun')) return Sun;
  if (amenityLower.includes('luna') || amenityLower.includes('moon')) return Moon;

  // Edificio y Estructura
  if (amenityLower.includes('edificio') || amenityLower.includes('building')) return Building2;
  if (amenityLower.includes('torre') || amenityLower.includes('tower')) return Building2;
  if (amenityLower.includes('piso') || amenityLower.includes('floor')) return Layers;

  return Sparkles; // Icono por defecto
};

// Interfaz para datos del CSV
interface CSVUnit {
  op: string;
  unidad: string;
  tipologia: string;
  precio: number;
  m2: number;
  orientacion: string;
  estacionamiento: number;
  bodega: number;
  gc: number;
  aceptaMascotas: boolean;
  estado: string;
  especial: boolean;
  tremendaPromo: boolean;
  descuento: number;
  mesesDescuento: number;
  linkListing: string;
}

interface BuildingForArriendaSinComision {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  coverImage: string;
  gallery: string[];
  precioDesde: number;
  precioHasta: number;
  precioPromedio: number;
  hasAvailability: boolean;
  totalUnidades: number;
  unidadesDisponibles: number;
  badges: Array<{ label: string; tag?: string; type: string }>;
  amenities: string[];
  tipologias: string[];
  unidades: CSVUnit[];
  selectedTypology?: string | null;
}

interface ArriendaSinComisionBuildingDetailProps {
  building: BuildingForArriendaSinComision;
}

export default function ArriendaSinComisionBuildingDetail({ building }: ArriendaSinComisionBuildingDetailProps) {
  const [hoveredTypology, setHoveredTypology] = useState<string | null>(null);
  const [showUrgencyBanner, setShowUrgencyBanner] = useState(true);

  const primaryBadge = getPrimaryBadge(building.badges);

  // Memoizar cálculos costosos
  const {
    availableUnits,
    typologyGroups,
    availableTypologies,
    totalAvailableUnits,
    minPrice,
    maxPrice,
    avgPrice
  } = useMemo(() => {
    const availableUnits = building.unidades.filter(unit =>
      !unit.estado || unit.estado.toLowerCase() === 'disponible'
    );

    const typologyGroups = availableUnits.reduce((acc, unit) => {
      const key = unit.tipologia;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(unit);
      return acc;
    }, {} as Record<string, typeof availableUnits>);

    const availableTypologies = Object.keys(typologyGroups);
    const totalAvailableUnits = availableUnits.length;
    const minPrice = Math.min(...availableUnits.map(u => u.precio));
    const maxPrice = Math.max(...availableUnits.map(u => u.precio));
    const avgPrice = Math.round(availableUnits.reduce((sum, u) => sum + u.precio, 0) / totalAvailableUnits);

    return {
      availableUnits,
      typologyGroups,
      availableTypologies,
      totalAvailableUnits,
      minPrice,
      maxPrice,
      avgPrice
    };
  }, [building.unidades]);

  const formatPrice = (price: number): string => {
    if (price >= 1_000_000) {
      const millions = price / 1_000_000;
      return `$${millions.toFixed(0)}M`;
    }
    return `$${price.toLocaleString('es-CL')}`;
  };

  const formatTypologyLabel = (tipology: string): string => {
    const mapping: Record<string, string> = {
      'Studio': 'Studio',
      '1D1B': '1 Dormitorio, 1 Baño',
      '2D1B': '2 Dormitorios, 1 Baño',
      '2D2B': '2 Dormitorios, 2 Baños',
      '3D2B': '3 Dormitorios, 2 Baños',
      '1 dormitorio': '1 Dormitorio',
      '2 dormitorios': '2 Dormitorios',
      '3 dormitorios': '3 Dormitorios',
      '4 dormitorios': '4 Dormitorios',
      'Estudio': 'Estudio'
    };
    return mapping[tipology] || tipology;
  };

  // Función para abrir Google Maps
  const openGoogleMaps = () => {
    window.open('https://maps.app.goo.gl/nLMtyQSTvepMAb1FA?g_st=ipc', '_blank');
  };

  // Simular visitas recientes para crear urgencia
  const recentVisitors = Math.floor(Math.random() * 15) + 5;
  const lastReservation = Math.floor(Math.random() * 60) + 5; // minutos

  return (
    <div className="min-h-screen bg-bg">
      {/* Banner de urgencia optimizado y centrado */}
      <AnimatePresence>
        {showUrgencyBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white py-4 relative overflow-hidden"
          >
            <div className="container mx-auto max-w-7xl px-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.div>
                <span>🔥 {recentVisitors} personas viendo</span>
                <span className="hidden sm:inline">•</span>
                <span>⏰ Última reserva hace {lastReservation} min</span>
                <span className="hidden sm:inline">•</span>
                <span>🎯 {totalAvailableUnits} unidades disponibles</span>
                <button
                  onClick={() => setShowUrgencyBanner(false)}
                  className="absolute right-4 text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section - Redistribuido para mejor aprovechamiento */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Separador visual entre header y contenido */}
          <div className="border-b border-border/50 my-8"></div>

          {/* Navegación integrada y mejorada */}
          <div className="mb-12 flex items-center justify-between">
            <button
              onClick={() => {
                sessionStorage.setItem('from-building-details', 'true');
                window.location.href = '/arrienda-sin-comision';
              }}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver a edificios
            </button>

            {/* Breadcrumb sutil para mejor UX */}
            <div className="text-xs text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer">Edificios</span>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">{building.name}</span>
            </div>
          </div>

          {/* Layout principal - 2 COLUMNAS IGUALES */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* GALERÍA - MÓVIL: ARRIBA, DESKTOP: DERECHA */}
            <div className="order-1 lg:order-2">
              {/* Galería con protagonismo */}
              <motion.div
                className="relative bg-gray-900:bg-gray-700 rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <ImageGallery
                  images={building.gallery}
                  coverImage={building.coverImage}
                  autoPlay={true}
                  autoPlayInterval={4000}
                  compact={false}
                />
              </motion.div>
            </div>

            {/* INFORMACIÓN - MÓVIL: ABAJO, DESKTOP: IZQUIERDA */}
            <div className="order-2 lg:order-1 space-y-6">
              {/* Header con nombre, ubicación y badges */}
              <div className="space-y-6">
                {/* Nombre y ubicación optimizada */}
                <div className="space-y-4">
                  {/* Título con mejor jerarquía */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-white leading-tight">
                    {building.name}
                  </h1>

                  {/* Ubicación mejorada - Layout horizontal optimizado */}
                  <div className="space-y-3">
                    {/* Comuna prominente */}
                    <div className="flex items-center gap-3 text-base sm:text-lg text-muted-foreground">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{building.comuna}</span>
                    </div>

                    {/* Dirección y botón mapa en línea */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm sm:text-base text-muted-foreground flex-1">
                        {building.address}
                      </span>
                      <motion.button
                        onClick={openGoogleMaps}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-400 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 flex-shrink-0"
                        aria-label="Abrir ubicación en Google Maps"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver mapa
                      </motion.button>
                    </div>
                  </div>

                  {/* Precio destacado - POSICIÓN ESTRATÉGICA PARA CONVERSIÓN */}
                  <motion.div
                    className="mt-6 p-4 bg-gray-900:bg-gray-700 rounded-lg border border-gray-700:border-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Precio desde</div>
                        <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {formatPrice(minPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Especial
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {totalAvailableUnits} disponibles
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Badges optimizados - Mejor distribución */}
                {building.badges && building.badges.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {building.badges.map((badge, index) => {
                      const BadgeIcon = getBadgeIcon(badge.label);
                      return (
                        <motion.div
                          key={badge.label}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <div className={`${getBadgeColor(badge.label)} px-3 py-2 text-sm font-semibold rounded-lg shadow-md text-center border flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-200`}>
                            <BadgeIcon className="w-4 h-4" />
                            {getShortBadgeText(badge.label)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Secciones unificadas - Layout de 2 columnas */}
          <motion.div
            className="mt-8 sm:mt-12 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:items-start">

                {/* Columna Izquierda - Tipologías */}
                {availableTypologies.length > 0 && (
                  <div className="space-y-6 h-full flex flex-col">
                    {/* Header con icono y título centrado */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white:text-white">Elige tu tipología ideal</h3>
                      </div>
                      <p className="text-sm text-gray-300:text-gray-400">
                        Selecciona la que mejor se adapte a tu estilo de vida
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                      {availableTypologies.map((typology, index) => {
                        const units = typologyGroups[typology];
                        const minPrice = Math.min(...units.map(u => u.precio));
                        const maxM2 = Math.max(...units.map(u => u.m2));
                        const minM2 = Math.min(...units.map(u => u.m2));
                        const isHovered = hoveredTypology === typology;

                        return (
                          <motion.div
                            key={typology}
                            className="group relative bg-gray-900:bg-gray-700 rounded-lg border border-gray-700:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden hover:bg-gray-800:hover:bg-gray-600"
                            whileHover={{
                              scale: 1.02,
                              y: -2,
                              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            onHoverStart={() => setHoveredTypology(typology)}
                            onHoverEnd={() => setHoveredTypology(null)}
                          >
                            <div className="p-4 space-y-4">
                              {/* Header de tipología */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                  <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white:text-white">{formatTypologyLabel(typology)}</h4>
                                  <p className="text-xs text-gray-300:text-gray-400">
                                    {units.length} unidad{units.length !== 1 ? 'es' : ''} disponible{units.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>

                              {/* Información clave */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-800:bg-gray-800 rounded-lg">
                                  <span className="text-sm text-gray-300:text-gray-400">Precio desde:</span>
                                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {formatPrice(minPrice)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-800:bg-gray-800 rounded-lg">
                                  <span className="text-sm text-gray-300:text-gray-400">Superficie:</span>
                                  <span className="font-semibold text-white:text-white">
                                    {minM2}-{maxM2} m²
                                  </span>
                                </div>
                              </div>

                              {/* CTA principal */}
                              <Link
                                href={`/arrienda-sin-comision/${building.slug}/unidad/${typology.toLowerCase().replace(/\s+/g, '-')}`}
                                className="block w-full"
                              >
                                <motion.button
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-300 text-sm"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Ver Departamentos
                                </motion.button>
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Columna Derecha - Amenidades */}
                {building.amenities && building.amenities.length > 0 && (
                  <div className="space-y-6 h-full flex flex-col">
                    {/* Header con icono y título centrado */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white:text-white">Comodidades del edificio</h3>
                      </div>
                      <p className="text-sm text-gray-300:text-gray-400">
                        Descubre todas las amenidades disponibles
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                      {building.amenities.map((amenity, index) => {
                        // Función para obtener el icono apropiado según la comodidad
                        const getAmenityIcon = (amenityName: string) => {
                          const lowerAmenity = amenityName.toLowerCase();
                          if (lowerAmenity.includes('acceso') || lowerAmenity.includes('control')) return <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
                          if (lowerAmenity.includes('citófono') || lowerAmenity.includes('intercom')) return <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
                          if (lowerAmenity.includes('gimnasio') || lowerAmenity.includes('gym')) return <Dumbbell className="w-4 h-4 text-green-600 dark:text-green-400" />;
                          if (lowerAmenity.includes('bicicletero') || lowerAmenity.includes('bici')) return <Bike className="w-4 h-4 text-green-600 dark:text-green-400" />;
                          if (lowerAmenity.includes('lavandería') || lowerAmenity.includes('lavadora')) return <WashingMachine className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
                          if (lowerAmenity.includes('internet') || lowerAmenity.includes('wifi')) return <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
                          if (lowerAmenity.includes('quincho') || lowerAmenity.includes('bbq')) return <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
                          if (lowerAmenity.includes('gourmet') || lowerAmenity.includes('evento')) return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
                          if (lowerAmenity.includes('seguridad')) return <Eye className="w-4 h-4 text-red-600 dark:text-red-400" />;
                          if (lowerAmenity.includes('terraza') || lowerAmenity.includes('panorámica')) return <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
                          if (lowerAmenity.includes('lounge') || lowerAmenity.includes('salón')) return <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
                          if (lowerAmenity.includes('transporte') || lowerAmenity.includes('cercano')) return <Car className="w-4 h-4 text-green-600 dark:text-green-400" />;
                          if (lowerAmenity.includes('conserjería') || lowerAmenity.includes('concierge')) return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
                          if (lowerAmenity.includes('ascensor') || lowerAmenity.includes('elevador')) return <ChevronUp className="w-4 h-4 text-gray-300:text-gray-400" />;
                          if (lowerAmenity.includes('comercio') || lowerAmenity.includes('tienda')) return <ShoppingCart className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
                          return <CheckCircle className="w-4 h-4 text-green-500" />;
                        };

                        return (
                          <motion.div
                            key={amenity}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-gray-900:bg-gray-700 rounded-lg hover:bg-gray-800:hover:bg-gray-600 transition-colors"
                          >
                            <div className="w-8 h-8 bg-gray-800:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              {getAmenityIcon(amenity)}
                            </div>
                            <span className="text-sm text-white:text-white font-medium">{amenity}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Commune Life Section */}
      {getFlagValue('COMMUNE_SECTION') && building.comuna && (
        <CommuneLifeSection
          commune={building.comuna}
          heroImage={building.coverImage || building.gallery?.[0] || "/images/estacioncentral-cover.jpg"}
          highlights={[
            {
              icon: Car,
              title: "Conectividad Total",
              description: "Metro y múltiples líneas de buses te conectan con toda la ciudad en minutos"
            },
            {
              icon: Users,
              title: "Comercio Local",
              description: "Mercados tradicionales, supermercados y tiendas de barrio a pasos de tu hogar"
            },
            {
              icon: Leaf,
              title: "Parques Cercanos",
              description: "Áreas verdes y parques para disfrutar del aire libre"
            },
            {
              icon: Star,
              title: "Educación Superior",
              description: "Universidades y centros de estudio a pocas cuadras de distancia"
            }
          ]}
          testimonial={{
            text: `Vivir en ${building.comuna} me ha dado la libertad de moverme por toda la ciudad sin problemas. Todo está cerca y bien conectado.`,
            author: "María González",
            rating: 5
          }}
          mapPins={[
            { name: "Metro", type: "metro", coordinates: [-33.4489, -70.6693] },
            { name: "Parque", type: "plaza", coordinates: [-33.4489, -70.6693] },
            { name: "Mercado", type: "shopping", coordinates: [-33.4489, -70.6693] },
            { name: "Universidad", type: "universidad", coordinates: [-33.4489, -70.6693] }
          ]}
        />
      )}
    </div>
  );
}
