import React from 'react';
import { render } from '@testing-library/react';

// Test minimalista para verificar el problema del componente
describe('QuintoAndarVisitScheduler Minimal Test', () => {
    it('debería poder importar y renderizar el componente básico', () => {
        // Intentar importar el componente directamente
        const { QuintoAndarVisitScheduler } = require('../../components/flow/QuintoAndarVisitScheduler.tsx');

        expect(QuintoAndarVisitScheduler).toBeDefined();
        expect(typeof QuintoAndarVisitScheduler).toBe('function');

        // Props mínimas
        const props = {
            isOpen: true,
            onClose: jest.fn(),
            listingId: 'test-listing',
            propertyName: 'Test Property',
            agentName: 'Test Agent',
            agentPhone: '+56912345678',
            agentEmail: 'test@example.com'
        };

        // Intentar renderizar
        expect(() => {
            render(<QuintoAndarVisitScheduler {...props} />);
        }).not.toThrow();
    });

    it('debería verificar que las dependencias están disponibles', () => {
        // Verificar que framer-motion está disponible
        const framerMotion = require('framer-motion');
        expect(framerMotion).toBeDefined();
        expect(framerMotion.motion).toBeDefined();

        // Verificar que lucide-react está disponible
        const lucideReact = require('lucide-react');
        expect(lucideReact).toBeDefined();
        expect(lucideReact.Calendar).toBeDefined();
    });
});
