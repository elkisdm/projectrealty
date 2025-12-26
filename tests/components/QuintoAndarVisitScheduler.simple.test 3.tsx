import React from 'react';
import { render } from '@testing-library/react';

// Test simple para verificar la importación
describe('QuintoAndarVisitScheduler Import Test', () => {
    it('debería poder importar el componente', () => {
        // Intentar importar el componente
        const { QuintoAndarVisitScheduler } = require('../../components/flow/QuintoAndarVisitScheduler');

        expect(QuintoAndarVisitScheduler).toBeDefined();
        expect(typeof QuintoAndarVisitScheduler).toBe('function');
    });

    it('debería poder renderizar el componente básico', () => {
        const { QuintoAndarVisitScheduler } = require('../../components/flow/QuintoAndarVisitScheduler');

        const props = {
            isOpen: true,
            onClose: jest.fn(),
            listingId: 'test-listing',
            propertyName: 'Test Property',
            propertyAddress: 'Test Address 123',
        };

        // Renderizar sin errores
        expect(() => {
            render(<QuintoAndarVisitScheduler {...props} />);
        }).not.toThrow();
    });
});
