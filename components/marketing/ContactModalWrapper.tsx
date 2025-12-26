'use client';

import { useState, useEffect } from 'react';
import ContactModal from './ContactModal';

export default function ContactModalWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para abrir el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Escuchar eventos personalizados para abrir el modal desde otros componentes
  useEffect(() => {
    const handleOpenModal = () => {
      openModal();
    };

    // Escuchar el evento personalizado
    window.addEventListener('openContactModal', handleOpenModal);

    return () => {
      window.removeEventListener('openContactModal', handleOpenModal);
    };
  }, []);

  return (
    <ContactModal 
      isOpen={isModalOpen} 
      onClose={closeModal} 
    />
  );
}
