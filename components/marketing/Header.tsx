'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { clx } from '@lib/utils';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { ContactDropdown } from './ContactDropdown';
import { Heart, User, Search, Menu, X, ChevronRight, Home } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Función para determinar si un enlace está activo
  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Función para generar breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Inicio', href: '/' }];

    let currentPath = '';
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const showBreadcrumb = pathname !== '/' && breadcrumbs.length > 1 && !pathname.startsWith('/property/');

  // Cerrar menú al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Manejar tecla Escape para cerrar menú
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className="sticky top-0 z-40 w-full bg-gray-800:bg-gray-900 border-b border-gray-700:border-gray-700 shadow-lg shadow-black/5">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 lg:py-4">
        <div className="flex items-center justify-between max-w-none">
          {/* Logo y Branding */}
          <div className="flex items-center space-x-6 lg:space-x-8 xl:space-x-12">
            <a
              href="/"
              className="flex items-center space-x-3 group"
              aria-label="Ir al inicio"
            >
              <div className="relative">
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                  <span className="text-sm lg:text-xl font-black text-white tracking-tight">E</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl lg:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  Elkis Realtor
                </span>
                <span className="text-xs font-medium text-gray-400:text-gray-400 tracking-wider uppercase hidden sm:block">
                  Propiedades Premium
                </span>
              </div>
            </a>

            {/* Navegación Principal */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a
                href="/property"
                className={clx(
                  "text-sm font-semibold transition-colors duration-200 relative group",
                  isActiveLink('/property')
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                Propiedades
                <span className={clx(
                  "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300",
                  isActiveLink('/property') ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </a>
              <a
                href="/arrienda-sin-comision"
                className={clx(
                  "text-sm font-semibold transition-colors duration-200 relative group",
                  isActiveLink('/arrienda-sin-comision')
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                Sin Comisión
                <span className={clx(
                  "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300",
                  isActiveLink('/arrienda-sin-comision') ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </a>
              <a
                href="/cotizador"
                className={clx(
                  "text-sm font-semibold transition-colors duration-200 relative group",
                  isActiveLink('/cotizador')
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                Cotizador
                <span className={clx(
                  "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300",
                  isActiveLink('/cotizador') ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </a>
              <a
                href="/mi-bio"
                className={clx(
                  "text-sm font-semibold transition-colors duration-200 relative group",
                  isActiveLink('/mi-bio')
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                Sobre Mí
                <span className={clx(
                  "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300",
                  isActiveLink('/mi-bio') ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </a>
            </nav>
          </div>

          {/* Acciones y Controles - Optimizadas para conversión */}
          <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            {/* Búsqueda - Solo en desktop */}
            <button
              className="hidden lg:block p-2 lg:p-3 text-gray-300:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 group"
              aria-label="Buscar propiedades"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Favoritos - Con contador */}
            <button
              className="hidden sm:block p-2 lg:p-3 text-gray-300:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg lg:rounded-xl transition-all duration-200 group relative"
              aria-label="Ver favoritos (3 propiedades guardadas)"
            >
              <Heart className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-sm">
                3
              </span>
            </button>

            {/* Theme Toggle - Compacto */}
            <div className="p-1 bg-gray-800:bg-gray-800 rounded-lg lg:rounded-xl">
              <ThemeToggle />
            </div>

            {/* CTA Principal - Contacto */}
            <div className="p-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg lg:rounded-xl shadow-lg shadow-blue-500/25">
              <ContactDropdown />
            </div>

            {/* Menú móvil */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 lg:p-3 text-gray-300:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 group"
              aria-label={isMobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <Menu className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Móvil */}
      {showBreadcrumb && (
        <div className="lg:hidden border-b border-gray-700:border-gray-700 bg-gray-800:bg-gray-900">
          <div className="w-full px-4 sm:px-6 py-2">
            <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                  )}
                  {index === 0 ? (
                    <a
                      href={crumb.href}
                      className="flex items-center text-gray-400:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Home className="w-3 h-3 mr-1" />
                      {crumb.label}
                    </a>
                  ) : index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                      {crumb.label}
                    </span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="text-gray-400:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                    >
                      {crumb.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Drawer Móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
              onClick={toggleMobileMenu}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-800:bg-gray-900 shadow-2xl border-l border-gray-700:border-gray-700 z-[60] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación móvil"
            >
              {/* Header del drawer */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-black text-white">E</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                    Elkis Realtor
                  </span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-300:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navegación móvil */}
              <nav className="p-4 space-y-2" role="navigation" aria-label="Navegación principal">
                <a
                  href="/property"
                  className={clx(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActiveLink('/property')
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Propiedades
                  {isActiveLink('/property') && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </a>
                <a
                  href="/arrienda-sin-comision"
                  className={clx(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActiveLink('/arrienda-sin-comision')
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Sin Comisión
                  {isActiveLink('/arrienda-sin-comision') && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </a>
                <a
                  href="/cotizador"
                  className={clx(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActiveLink('/cotizador')
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Cotizador
                  {isActiveLink('/cotizador') && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </a>
                <a
                  href="/mi-bio"
                  className={clx(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActiveLink('/mi-bio')
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Sobre Mí
                  {isActiveLink('/mi-bio') && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </a>
              </nav>

              {/* Acciones móviles */}
              <div className="p-4 border-t border-gray-700:border-gray-700 space-y-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-gray-300:text-gray-400">Tema</span>
                  <ThemeToggle />
                </div>

                <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200">
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
