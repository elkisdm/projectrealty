'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

export function DownloadPDFButton() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            // Dynamic import para reducir bundle size
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const element = document.getElementById('cv-content');
            if (!element) {
                console.error('No se encontró el elemento #cv-content');
                setIsGenerating(false);
                return;
            }

            // Obtener el color de fondo del tema actual
            const computedStyle = window.getComputedStyle(document.documentElement);
            const bgColor = computedStyle.getPropertyValue('--bg').trim() || '#ffffff';
            
            // Configurar opciones para mejor calidad
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: bgColor,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            // Calcular altura de imagen escalada
            const scaledHeight = imgHeight * ratio;
            let heightLeft = scaledHeight;
            let position = imgY;

            // Agregar primera página
            pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, scaledHeight);
            heightLeft -= pdfHeight;

            // Agregar páginas adicionales si es necesario
            while (heightLeft >= 0) {
                position = heightLeft - scaledHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, scaledHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('CV-Elkis-Daza.pdf');
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, intenta nuevamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            aria-label="Descargar CV en PDF"
        >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
        </button>
    );
}
