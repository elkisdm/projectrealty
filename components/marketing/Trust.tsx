"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function Trust() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    {
      number: "12+",
      label: "años en el mercado",
      description: "Construyendo confianza desde 2012",
    },
    {
      number: "100K+",
      label: "arrendatarios felices",
      description: "Familias que encontraron su hogar",
    },
    {
      number: "100%",
      label: "proceso digital",
      description: "Sin papeles, sin complicaciones",
    },
  ];

  const testimonials = [
    {
      name: "Carla + Bruno 🐕",
      location: "Ñuñoa",
      story: "disfrutan de su terraza soleada en Ñuñoa.",
      image: "🏠"
    },
    {
      name: "Ignacio",
      location: "Providencia", 
      story: "eligió Providencia y se olvidó de la incertidumbre: precio fijo 12 meses.",
      image: "🏢"
    },
    {
      name: "María + Tomás",
      location: "Las Condes",
      story: "encontraron su hogar ideal sin aval y con su mascota incluida.",
      image: "🏡"
    }
  ];

  return (
    <section aria-labelledby="trust-heading" className="px-6 py-16 lg:px-8 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 id="trust-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Más que arriendos, construimos confianza
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cada número cuenta una historia de libertad y tranquilidad
          </p>
        </motion.div>

        {/* Stats section */}
        <div className="mt-16" ref={ref}>
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted/20 p-8 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                  <motion.div 
                    className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent lg:text-5xl"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="mt-2 text-lg font-semibold text-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials section */}
        <div className="mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              Historias que inspiran
            </h3>
            <p className="mt-2 text-muted-foreground">
              Cada hogar tiene una historia, cada historia tiene un final feliz
            </p>
          </motion.div>
          
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 p-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/5 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {testimonial.image}
                </div>
                <blockquote className="text-lg font-medium text-foreground mb-4">
                  "{testimonial.name} {testimonial.story}"
                </blockquote>
                <div className="text-sm text-muted-foreground">
                  {testimonial.location}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Tu próximo hogar ya está disponible. Elige hoy y vive sin complicaciones.
          </p>
          <div className="mt-6">
            <a
              href="#buildings-grid"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
            >
              Ver departamentos disponibles
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


