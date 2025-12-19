"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreateReviewSchema, type CreateReview } from "@schemas/review";
import { RatingDisplay } from "./RatingDisplay";
import {
  notifySuccess,
  notifyError,
} from "@lib/ecommerce/toast";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit: (data: CreateReview) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

// Schema extendido para el formulario (incluye userName)
const ReviewFormSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(0).max(5), // Permitir 0 para validación manual
  title: z.string().max(100).optional(),
  comment: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(5).optional(),
  userName: z.string().min(1, "El nombre es requerido").max(100),
  userEmail: z.string().email().optional(),
}).refine((data) => data.rating > 0, {
  message: "Por favor selecciona una calificación",
  path: ["rating"],
});

type ReviewFormData = z.infer<typeof ReviewFormSchema>;

/**
 * ReviewForm - Formulario para crear reseña
 * 
 * Características:
 * - Rating selector interactivo
 * - Campos: rating, título, comentario, imágenes
 * - Validación con react-hook-form + Zod
 * - Upload de imágenes (preview)
 * - Estados de loading y éxito
 * - Notificaciones
 */
export function ReviewForm({
  productId,
  productName,
  onSubmit,
  onCancel,
  className = "",
}: ReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: {
      productId,
      rating: 0,
      userName: "",
      title: "",
      comment: "",
      images: [] as string[],
    },
  });

  const comment = watch("comment");
  const commentLength = comment?.length || 0;

  // Manejar selección de rating
  const handleRatingChange = useCallback((rating: number) => {
    setSelectedRating(rating);
  }, []);

  // Manejar upload de imágenes
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newImages: string[] = [];
      const maxImages = 5 - selectedImages.length;

      Array.from(files)
        .slice(0, maxImages)
        .forEach((file) => {
          // Validar tipo
          if (!file.type.startsWith("image/")) {
            notifyError("Error", "Solo se permiten archivos de imagen");
            return;
          }

          // Validar tamaño (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            notifyError("Error", "Las imágenes deben ser menores a 5MB");
            return;
          }

          // Crear URL temporal para preview
          const reader = new FileReader();
          reader.onload = (event) => {
            const url = event.target?.result as string;
            newImages.push(url);
            setSelectedImages((prev) => [...prev, ...newImages]);
          };
          reader.readAsDataURL(file);
        });
    },
    [selectedImages.length]
  );

  // Remover imagen
  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Manejar envío
  const onSubmitForm = async (data: ReviewFormData) => {
    if (selectedRating === 0) {
      notifyError("Error", "Por favor selecciona una calificación");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReview = {
        productId,
        rating: selectedRating,
        title: data.title || undefined,
        comment: data.comment,
        images: selectedImages.length > 0 ? selectedImages : [],
        userName: data.userName,
        userEmail: data.userEmail,
      };

      await onSubmit(reviewData);

      // Reset form
      reset();
      setSelectedRating(0);
      setSelectedImages([]);
      setIsOpen(false);

      notifySuccess("Reseña enviada", "Tu reseña ha sido publicada exitosamente");
    } catch (error) {
      notifyError(
        "Error",
        "No se pudo enviar la reseña. Por favor intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
      >
        Escribir reseña
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-card border border-border rounded-2xl p-6 space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text">Escribir reseña</h3>
        {onCancel && (
          <button
            onClick={() => {
              setIsOpen(false);
              onCancel();
            }}
            className="p-2 text-subtext hover:text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
            aria-label="Cerrar formulario"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Nombre */}
        <div>
          <label
            htmlFor="userName"
            className="block text-sm font-semibold text-text mb-2"
          >
            Tu nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="userName"
            type="text"
            {...register("userName")}
            className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent"
            placeholder="Ej: Juan Pérez"
          />
          {errors.userName && (
            <p className="mt-1 text-sm text-red-500">{errors.userName.message}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Calificación <span className="text-red-500">*</span>
          </label>
          <RatingDisplay
            rating={selectedRating}
            interactive={true}
            onRatingChange={handleRatingChange}
            size="lg"
            className="justify-start"
          />
          {selectedRating === 0 && (
            <p className="mt-1 text-sm text-red-500">
              Por favor selecciona una calificación
            </p>
          )}
        </div>

        {/* Título */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-text mb-2"
          >
            Título (opcional)
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            maxLength={100}
            className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent"
            placeholder="Ej: Excelente producto"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Comentario */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-semibold text-text mb-2"
          >
            Tu reseña <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            {...register("comment")}
            rows={6}
            minLength={10}
            maxLength={2000}
            className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent resize-none"
            placeholder="Comparte tu experiencia con este producto..."
          />
          <div className="flex items-center justify-between mt-1">
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
            <p className="text-sm text-subtext ml-auto">
              {commentLength}/2000 caracteres
            </p>
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Fotos (opcional, máximo 5)
          </label>
          <div className="space-y-4">
            {/* Preview de imágenes */}
            {selectedImages.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                  >
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remover imagen"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input de upload */}
            {selectedImages.length < 5 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#8B6CFF] transition-colors focus-within:ring-2 focus-within:ring-[#8B6CFF]">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={selectedImages.length >= 5}
                />
                <div className="flex flex-col items-center gap-2 text-subtext">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">
                    Agregar fotos ({selectedImages.length}/5)
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || selectedRating === 0}
            className="flex-1 px-6 py-3 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Publicar reseña"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              reset();
              setSelectedRating(0);
              setSelectedImages([]);
            }}
            className="px-6 py-3 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold text-text focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}

