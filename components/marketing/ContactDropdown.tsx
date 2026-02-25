'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { buildWhatsAppUrl } from '@lib/whatsapp';
import { motion, AnimatePresence } from 'framer-motion';

export function ContactDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const whatsappUrl = buildWhatsAppUrl({
    message: 'Hola, me interesa conocer más sobre sus propiedades'
  });

  const contactOptions = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: whatsappUrl || '#',
      disabled: !whatsappUrl,
      onClick: () => {
        if (whatsappUrl) {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
        setIsOpen(false);
      }
    },
    {
      label: 'Teléfono',
      icon: Phone,
      href: 'tel:+56912345678',
      onClick: () => setIsOpen(false)
    },
    {
      label: 'Email',
      icon: Mail,
      href: 'mailto:contacto@elkisrealtor.com',
      onClick: () => setIsOpen(false)
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
        aria-label="Opciones de contacto"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Contacto
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-1">
                {contactOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isDisabled = option.disabled;

                  if (isDisabled) {
                    return (
                      <div
                        key={option.label}
                        className="px-4 py-3 text-sm text-muted-foreground cursor-not-allowed opacity-50"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <a
                      key={option.label}
                      href={option.href}
                      onClick={option.onClick}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors duration-150"
                      role="menuitem"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}






