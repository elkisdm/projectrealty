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

            const element = document.querySelector('main');
            if (!element) {
                setIsGenerating(false);
                return;
            }

            // Configurar opciones para mejor calidad
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#0a0a0a',
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Descargar CV en PDF"
        >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
        </button>
    );
}
