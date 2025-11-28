"use client";

import { motion } from "framer-motion";
import { Heart, Shield, PawPrint, Zap } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Porque confiar en ti es suficiente",
    description: "Sin aval, sin complicaciones. Tu historial de pago es lo que importa.",
    color: "from-red-500 to-pink-600",
    bgColor: "from-red-50 to-pink-50",
    darkBgColor: "from-red-950/30 to-pink-950/30",
    ringColor: "ring-red-200/50 dark:ring-red-800/50"
  },
  {
    icon: Shield,
    title: "Tu tranquilidad, en pequeños pasos",
    description: "Garantía en cuotas flexibles que se adaptan a tu realidad.",
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-50",
    darkBgColor: "from-blue-950/30 to-indigo-950/30",
    ringColor: "ring-blue-200/50 dark:ring-blue-800/50"
  },
  {
    icon: PawPrint,
    title: "Ellos también merecen un nuevo hogar",
    description: "Pet friendly sin restricciones. Tu compañero es parte de la familia.",
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-50 to-orange-50",
    darkBgColor: "from-amber-950/30 to-orange-950/30",
    ringColor: "ring-amber-200/50 dark:ring-amber-800/50"
  },
  {
    icon: Zap,
    title: "Lo simple debería quedarse simple",
    description: "Sin comisión oculta, sin sorpresas. Solo transparencia total.",
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50",
    darkBgColor: "from-purple-950/30 to-violet-950/30",
    ringColor: "ring-purple-200/50 dark:ring-purple-800/50"
  }
];

export default function Benefits() {
  return (
    <section className="py-24 bg-gradient-to-b from-bg to-surface/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Beneficios que construyen confianza
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Diseñamos cada detalle pensando en tu libertad y tranquilidad
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative p-6 rounded-3xl bg-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5">
                {/* Icono con gradiente */}
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${benefit.bgColor} dark:${benefit.darkBgColor} ring-1 ${benefit.ringColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className={`w-6 h-6 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`} />
                </div>

                {/* Contenido */}
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-foreground/80 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Efecto hover sutil */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent to-transparent group-hover:from-white/5 group-hover:to-transparent dark:group-hover:from-white/5 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Todos nuestros departamentos incluyen estos beneficios</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
