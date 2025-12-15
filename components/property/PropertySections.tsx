"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  Info,
  Star,
  CheckCircle,
  Shield,
  Users,
  Car,
  Wifi,
  Dumbbell,
  Coffee,
  Calendar,
  MessageCircle,
  MapPin,
  Square,
  AlertCircle
} from "lucide-react";
import type { Building } from "@schemas/models";

interface UnitDetails {
  tipologia: string;
  m2: number;
  piso: string;
  orientacion: string;
  area_interior?: number;
  area_exterior?: number;
  amoblado: boolean;
  petFriendly: boolean;
  codigoInterno?: string;
  garantia_cuotas?: number;
  renta_minima?: number;
}

interface PropertySectionsProps {
  building: Building;
  unitDetails: UnitDetails;
  originalPrice: number;
  variant?: "catalog" | "marketing" | "admin";
  className?: string;
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700:border-gray-700 rounded-2xl overflow-hidden bg-gray-800:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
        aria-controls={`collapsible-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-800:bg-gray-700 text-gray-300:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className="font-bold text-lg text-white:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <div className="p-2 rounded-lg bg-gray-800:bg-gray-600 shadow-sm">
          <ChevronDown className="w-5 h-5 text-gray-300:text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div
          id={`collapsible-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="overflow-hidden"
        >
          <div className="px-6 py-6 bg-gray-800:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export function PropertySections({
  building,
  unitDetails,
  originalPrice,
  variant = "catalog",
  className = ""
}: PropertySectionsProps) {
  // Amenidades del edificio
  const amenidades = [
    { nombre: "WiFi incluido", icon: Wifi, disponible: true },
    { nombre: "Estacionamiento", icon: Car, disponible: building.amenities.includes("estacionamiento") },
    { nombre: "Gimnasio", icon: Dumbbell, disponible: building.amenities.includes("gimnasio") },
    { nombre: "Sala común", icon: Coffee, disponible: building.amenities.includes("sala_comun") },
    { nombre: "Seguridad 24/7", icon: Shield, disponible: true },
    { nombre: "Conserjería", icon: Users, disponible: building.amenities.includes("conserjeria") }
  ];

  const getRequisitos = () => {
    if (variant === "admin") {
      return {
        generales: [
          "Cédula de identidad chilena vigente",
          "Puntaje financiero 999 titular y aval(es)",
          "Renta líquida igual o mayor a $" + (originalPrice * 3).toLocaleString('es-CL')
        ],
        dependiente: [
          "Tres últimas liquidaciones de sueldo",
          "Certificado de cotizaciones de AFP"
        ],
        independiente: [
          "Informe mensual de boletas de honorario (6 meses)",
          "Carpeta tributaria o formulario 29 (6 meses)"
        ]
      };
    }

    // Variantes catalog y marketing
    return {
      generales: [
        "Cédula de identidad chilena vigente",
        "Puntaje financiero 999 titular y aval(es)",
        "Renta líquida igual o mayor a $" + (originalPrice * 3).toLocaleString('es-CL')
      ],
      dependiente: [
        "Tres últimas liquidaciones de sueldo",
        "Certificado de cotizaciones de AFP"
      ],
      independiente: [
        "Informe mensual de boletas de honorario (6 meses)",
        "Carpeta tributaria o formulario 29 (6 meses)"
      ]
    };
  };

  const requisitos = getRequisitos();

  return (
    <section className={`space-y-3 lg:space-y-4 ${className}`}>
      {/* Detalles de la unidad mejorados */}
      <CollapsibleSection title="Detalles de la unidad" icon={Info} defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Información básica */}
          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg lg:rounded-xl border border-indigo-200 dark:border-indigo-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
              <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-white:text-white text-sm lg:text-base">{unitDetails.tipologia}</div>
              <div className="text-xs lg:text-sm text-gray-300:text-gray-400">Tipología</div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg lg:rounded-xl border border-indigo-200 dark:border-indigo-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
              <Square className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-white:text-white text-sm lg:text-base">{unitDetails.m2}</div>
              <div className="text-xs lg:text-sm text-gray-300:text-gray-400">Metros cuadrados</div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg lg:rounded-xl border border-indigo-200 dark:border-indigo-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-white:text-white text-sm lg:text-base">{unitDetails.piso}</div>
              <div className="text-xs lg:text-sm text-gray-300:text-gray-400">Piso</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-white:text-white">{unitDetails.orientacion}</div>
              <div className="text-sm text-gray-300:text-gray-400">Orientación</div>
            </div>
          </div>

          {/* Áreas específicas */}
          {unitDetails.area_interior && (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <Square className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-bold text-white:text-white">{unitDetails.area_interior}m²</div>
                <div className="text-sm text-gray-300:text-gray-400">Área interior</div>
              </div>
            </div>
          )}

          {unitDetails.area_exterior && (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <Square className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-bold text-white:text-white">{unitDetails.area_exterior}m²</div>
                <div className="text-sm text-gray-300:text-gray-400">Área exterior</div>
              </div>
            </div>
          )}

          {/* Servicios y opciones */}
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
            <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
              <Car className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="font-bold text-white:text-white">No disponible</div>
              <div className="text-sm text-gray-300:text-gray-400">Estacionamiento</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <Square className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-bold text-white:text-white">Desde $30.000</div>
              <div className="text-sm text-gray-300:text-gray-400">Bodega</div>
            </div>
          </div>

          {/* Características especiales */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${unitDetails.amoblado
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
            : 'bg-gray-900:bg-gray-700 border-gray-700:border-gray-600'}`}>
            <div className={`p-2 rounded-lg ${unitDetails.amoblado
              ? 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400'
              : 'bg-gray-800:bg-gray-600 text-gray-400'}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white:text-white">
                {unitDetails.amoblado ? 'Amoblado' : 'Sin amoblar'}
              </div>
              <div className="text-sm text-gray-300:text-gray-400">Estado</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${unitDetails.petFriendly
            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
            : 'bg-gray-900:bg-gray-700 border-gray-700:border-gray-600'}`}>
            <div className={`p-2 rounded-lg ${unitDetails.petFriendly
              ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400'
              : 'bg-gray-800:bg-gray-600 text-gray-400'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white:text-white">
                {unitDetails.petFriendly ? 'Permitidas' : 'No permitidas'}
              </div>
              <div className="text-sm text-gray-300:text-gray-400">Mascotas</div>
            </div>
          </div>

          {/* Información de garantía */}
          {unitDetails.garantia_cuotas && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="font-bold text-white:text-white">{unitDetails.garantia_cuotas} cuotas</div>
                <div className="text-sm text-gray-300:text-gray-400">Garantía</div>
              </div>
            </div>
          )}

          {unitDetails.renta_minima && (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
              <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="font-bold text-white:text-white">${unitDetails.renta_minima.toLocaleString('es-CL')}</div>
                <div className="text-sm text-gray-300:text-gray-400">Renta mínima</div>
              </div>
            </div>
          )}

          {/* Código interno */}
          {unitDetails.codigoInterno && (
            <div className="flex items-center gap-3 p-3 bg-gray-900:bg-gray-700 rounded-xl border border-gray-700:border-gray-600">
              <div className="p-2 bg-gray-800:bg-gray-600 rounded-lg">
                <Info className="w-5 h-5 text-gray-300:text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-white:text-white">{unitDetails.codigoInterno}</div>
                <div className="text-sm text-gray-300:text-gray-400">Código interno</div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Disclaimer sobre servicios adicionales */}
      {(building.gc_mode === 'MF' || unitDetails.estacionamiento || unitDetails.bodega) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 lg:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-sm lg:text-base">
                Servicios Adicionales
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                Los servicios de estacionamiento y bodega son adicionales y están sujetos a disponibilidad. 
                Por favor, consulta con el corredor sobre la disponibilidad y el costo de estos servicios antes de realizar tu reserva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Amenidades mejoradas */}
      <CollapsibleSection title="Amenidades del edificio" icon={Star}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amenidades.map((amenidad) => (
            <div
              key={amenidad.nombre}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${amenidad.disponible
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                : 'bg-gray-900:bg-gray-700 border border-gray-700:border-gray-600'
                }`}
            >
              <div className={`p-2 rounded-lg ${amenidad.disponible
                ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                : 'bg-gray-800:bg-gray-600 text-gray-400'
                }`}>
                <amenidad.icon className="w-5 h-5" />
              </div>
              <span className={`flex-1 font-medium ${amenidad.disponible
                ? 'text-white:text-white'
                : 'text-gray-400:text-gray-400'
                }`}>
                {amenidad.nombre}
              </span>
              {amenidad.disponible && (
                <div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Características principales mejoradas */}
      <CollapsibleSection title="Características principales" icon={CheckCircle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              "Ventanas termopanel",
              "Agua caliente central",
              "Cocina equipada",
              "Seguridad 24/7"
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
              >
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-white:text-white">{feature}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              "Calefacción individual",
              "Logia incluida",
              "Closet empotrado",
              "Vista despejada"
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
              >
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-white:text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Requisitos completos optimizados */}
      <CollapsibleSection title="Requisitos para arrendar" icon={Shield}>
        <div className="space-y-6">
          {/* Requisitos Generales */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-white:text-white">Requisitos Generales</h3>
            </div>
            <div className="space-y-3">
              {requisitos.generales.map((requisito, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800:bg-gray-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-white:text-white">{requisito}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de Trabajador */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Trabajador Dependiente */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-white:text-white">Trabajador Dependiente</h3>
              </div>
              <div className="space-y-3">
                {requisitos.dependiente.map((requisito, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800:bg-gray-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-white:text-white">{requisito}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trabajador Independiente */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <Square className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-white:text-white">Trabajador Independiente</h3>
              </div>
              <div className="space-y-3">
                {requisitos.independiente.map((requisito, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800:bg-gray-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm text-white:text-white">{requisito}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nota para Extranjeros */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Si eres extranjero y tienes cédula vencida puedes solicitar visita y/o postular presentando tu visa en trámite.
              </p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Información del edificio mejorada */}
      <CollapsibleSection title="Información del edificio" icon={Info}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-white:text-white">Ubicación</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">{building.comuna}, Santiago</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-white:text-white">Construcción</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">2020</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-white:text-white">Unidades</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">{building.units.length} departamentos</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-white:text-white">Administración</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Profesional con conserjería 24/7</p>
          </div>
        </div>
      </CollapsibleSection>
    </section>
  );
}









