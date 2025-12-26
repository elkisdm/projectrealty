'use client';

import { Zap, Smartphone, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BenefitCard } from './BenefitCard';

/**
 * Sección de beneficios
 * Muestra 3 beneficios principales según especificación:
 * 1. Arrienda sin estrés
 * 2. Todo, aquí y ahora
 * 3. Somos líderes en el mercado
 */
export function BenefitsSection() {
  const prefersReducedMotion = useReducedMotion();

  const benefits = [
    {
      title: 'Arrienda sin estrés',
      description: 'Facilitamos tu proceso de arriendo, conduciéndote de forma rápida y sencilla hacia tu nuevo hogar.',
      icon: <Zap className="w-8 h-8" />,
    },
    {
      title: 'Todo, aquí y ahora',
      description: 'Priorizamos tu comodidad: consulta cuentas, realiza pagos y reserva espacios comunes en nuestra app.',
      icon: <Smartphone className="w-8 h-8" />,
    },
    {
      title: 'Somos líderes en el mercado',
      description: 'Contamos con 12 años de experiencia y más de 105.000 arrendatarios que han confiado en nosotros.',
      icon: <Award className="w-8 h-8" />,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-text mb-4 sm:text-4xl">
          ¿Por qué arrendar con nosotros?
        </h2>
        <p className="text-lg text-subtext max-w-2xl mx-auto">
          Nuestro servicio es ¡fácil, rápido y seguro!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <BenefitCard
            key={benefit.title}
            title={benefit.title}
            description={benefit.description}
            icon={benefit.icon}
          />
        ))}
      </div>
    </section>
  );
}





