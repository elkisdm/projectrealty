"use client";

import React, { useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useReducedMotion } from "@hooks/useReducedMotion";
import type { Unit, Building } from "@schemas/models";
import { track } from "@lib/analytics";
import { normalizeChileanPhone, isValidChileanPhone } from "@lib/validations/visit";

// Schema de validación simplificado para pre-aprobación
const preApprovalSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("El email debe tener un formato válido"),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || isValidChileanPhone(val),
      {
        message: "El teléfono debe tener un formato chileno válido"
      }
    )
    .transform((val) => val ? normalizeChileanPhone(val) : val),
});

type PreApprovalFormData = z.infer<typeof preApprovalSchema>;

export interface PreApprovalData extends PreApprovalFormData {
  unitId: string;
  buildingId: string;
}

interface PreApprovalCardProps {
  unit: Unit;
  building: Building;
  onComplete?: (data: PreApprovalData) => void;
  variant?: "modal" | "inline" | "compact";
  className?: string;
}

export function PreApprovalCard({
  unit,
  building,
  onComplete,
  variant = "inline",
  className = ""
}: PreApprovalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PreApprovalFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PreApprovalFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "review" | "pending">("pending");
  const prefersReducedMotion = useReducedMotion();

  const handleOpen = () => {
    setIsOpen(true);
    setErrors({});
    setIsComplete(false);
    setApprovalStatus("pending");
    track("pre_approval_start", {
      property_id: building.id,
      unit_id: unit.id,
    });
  };

  const handleClose = () => {
    if (!isComplete) {
      track("pre_approval_abandon", {
        property_id: building.id,
        unit_id: unit.id,
        step: "form",
      });
    }
    setIsOpen(false);
    setFormData({ name: "", email: "", phone: "" });
    setErrors({});
  };

  const validateField = (field: keyof PreApprovalFormData, value: string) => {
    try {
      const fieldSchema = preApprovalSchema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(value || "");
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message || "Campo inválido",
        }));
      }
    }
  };

  const handleInputChange = (field: keyof PreApprovalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todo el formulario
    const result = preApprovalSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof PreApprovalFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof PreApprovalFormData] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simular evaluación de pre-aprobación (en producción, esto sería una llamada API)
    setTimeout(() => {
      const approved = Math.random() > 0.3; // 70% de aprobación simulada
      const status = approved ? "approved" : "review";
      setApprovalStatus(status);
      setIsComplete(true);
      setIsSubmitting(false);

      const submissionData: PreApprovalData = {
        ...result.data,
        unitId: unit.id,
        buildingId: building.id,
      };

      track("pre_approval_complete", {
        property_id: building.id,
        unit_id: unit.id,
        approved: approved,
      });

      if (onComplete) {
        onComplete(submissionData);
      }

      // Auto-cerrar después de 3 segundos si es modal
      if (variant === "modal" && approved) {
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    }, 1500);
  };

  // Render inline/compact (sin modal)
  if (variant !== "modal") {
    return (
      <div className={className}>
        <button
          onClick={handleOpen}
          className={`w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 ${className}`}
          aria-label="Abrir formulario de pre-aprobación"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                ¿Cumples con todos los requisitos?
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Haz tu preaprobación en solo 30 segundos y asegura tu visita.
              </p>
              <span className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Pre-aprobación en 30s
              </span>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="preapproval-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      id="preapproval-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      onBlur={(e) => validateField("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Juan Pérez"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="preapproval-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      id="preapproval-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={(e) => validateField("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="juan@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="preapproval-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      id="preapproval-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onBlur={(e) => validateField("phone", e.target.value || "")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="+56 9 1234 5678"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluando...
                        </span>
                      ) : (
                        "Enviar"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>

                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          {approvalStatus === "approved"
                            ? "¡Pre-aprobado!"
                            : "En revisión"}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {approvalStatus === "approved"
                            ? "Estás pre-aprobado. ¡Agenda tu visita ahora!"
                            : "Tu solicitud será revisada y te contactaremos pronto."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render modal
  return (
    <>
      <button
        onClick={handleOpen}
        className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        aria-label="Abrir formulario de pre-aprobación"
      >
        Pre-aprobación en 30s
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Pre-aprobación Rápida
                    </h3>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Completa este formulario rápido para saber si estás pre-aprobado.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Same form fields as inline version */}
                    <div>
                      <label htmlFor="modal-preapproval-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        id="modal-preapproval-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        onBlur={(e) => validateField("name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Juan Pérez"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="modal-preapproval-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        id="modal-preapproval-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={(e) => validateField("email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="juan@ejemplo.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="modal-preapproval-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono (opcional)
                      </label>
                      <input
                        id="modal-preapproval-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        onBlur={(e) => validateField("phone", e.target.value || "")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="+56 9 1234 5678"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Evaluando...
                          </span>
                        ) : (
                          "Enviar"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>

                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {approvalStatus === "approved"
                              ? "¡Pre-aprobado!"
                              : "En revisión"}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {approvalStatus === "approved"
                              ? "Estás pre-aprobado. ¡Agenda tu visita ahora!"
                              : "Tu solicitud será revisada y te contactaremos pronto."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
