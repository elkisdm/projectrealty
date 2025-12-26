"use client";

import React from "react";
import { FileText, DollarSign, Shield, Calendar, CheckCircle } from "lucide-react";
import type { Unit, Building } from "@schemas/models";

interface PropertyRequirementsTabProps {
  unit: Unit;
  building: Building;
}

export function PropertyRequirementsTab({ unit, building }: PropertyRequirementsTabProps) {
  // Calcular renta mínima (valor arriendo × 3)
  const rentaMinima = (unit.price || 0) * 3;

  // Requisitos del edificio
  const requisitosArriendo = building.requisitosArriendo;
  const infoContrato = building.infoContrato;

  // Documentación requerida
  const documentacionDependiente = requisitosArriendo?.documentacion?.dependiente || [
    "RUT vigente",
    "3 últimas liquidaciones de sueldo",
    "Certificado de trabajo",
    "Certificado de antecedentes"
  ];
  const documentacionIndependiente = requisitosArriendo?.documentacion?.independiente || [
    "RUT vigente",
    "Últimos 6 meses de boletas de honorarios",
    "Declaración de renta",
    "Certificado de antecedentes"
  ];
  const documentacionExtranjeros = requisitosArriendo?.documentacion?.extranjeros || [
    "Pasaporte vigente",
    "Visa de trabajo o residencia",
    "Comprobantes de ingresos",
    "Certificado de antecedentes (país de origen)"
  ];

  // Condiciones financieras
  const rentaMinimaMultiplo = requisitosArriendo?.condicionesFinancieras?.rentaMinimaMultiplo;
  const rentaMinimaRequerida = rentaMinimaMultiplo ? `${rentaMinimaMultiplo} del arriendo` : `$${rentaMinima.toLocaleString()}`;
  const requiereAval = requisitosArriendo?.condicionesFinancieras?.avales?.permitidos ?? true;
  const puntajeMinimo = requisitosArriendo?.condicionesFinancieras?.puntajeFinanciero;

  // Duración contrato
  const duracionContrato = infoContrato?.duracionAnos ? `${infoContrato.duracionAnos} año${infoContrato.duracionAnos > 1 ? 's' : ''}` : "12 meses";
  const condicionesSalida = infoContrato?.despuesDelAno?.salidaLibre
    ? "Salida libre después del año"
    : (infoContrato?.despuesDelAno?.avisoPrevio ? "Aviso previo requerido" : "Aviso con 30 días de anticipación");

  return (
    <div className="space-y-6">
      {/* Documentación requerida */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
            <FileText className="w-6 h-6 text-[#8B6CFF]" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-text mb-4">Documentación requerida</h4>

            <div className="space-y-4">
              {/* Dependiente */}
              <div>
                <h5 className="text-sm font-semibold text-text mb-2">Dependiente</h5>
                <ul className="space-y-2">
                  {documentacionDependiente.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Independiente */}
              <div>
                <h5 className="text-sm font-semibold text-text mb-2">Independiente</h5>
                <ul className="space-y-2">
                  {documentacionIndependiente.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extranjeros */}
              <div>
                <h5 className="text-sm font-semibold text-text mb-2">Extranjeros</h5>
                <ul className="space-y-2">
                  {documentacionExtranjeros.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Condiciones financieras */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
            <DollarSign className="w-6 h-6 text-[#8B6CFF]" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-text mb-4">Condiciones financieras</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <span className="text-sm text-subtext">Renta mínima</span>
                <span className="text-base font-semibold text-text">
                  {rentaMinimaRequerida}
                </span>
              </div>
              <div className="text-xs text-text-muted">
                (Valor arriendo × 3)
              </div>

              {requiereAval && (
                <div className="flex items-center gap-2 p-3 bg-surface rounded-lg">
                  <Shield className="w-4 h-4 text-[#8B6CFF]" />
                  <span className="text-sm text-text">Aval requerido</span>
                </div>
              )}

              {puntajeMinimo && (
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <span className="text-sm text-subtext">Puntaje mínimo</span>
                  <span className="text-base font-semibold text-text">{puntajeMinimo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Duración contrato */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#8B6CFF]/10 rounded-xl">
            <Calendar className="w-6 h-6 text-[#8B6CFF]" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-text mb-3">Duración contrato</h4>
            <p className="text-text mb-4">{duracionContrato}</p>

            <h5 className="text-sm font-semibold text-text mb-2">Condiciones de salida</h5>
            <p className="text-sm text-subtext">{condicionesSalida}</p>
          </div>
        </div>
      </div>
    </div>
  );
}





