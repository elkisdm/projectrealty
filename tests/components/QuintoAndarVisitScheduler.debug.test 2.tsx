import React from 'react';

// Test de debug para verificar importaciones
describe('QuintoAndarVisitScheduler Debug', () => {
    it('debería poder importar los tipos', () => {
        // Los tipos se importan correctamente en el entorno de Jest
        // Verificamos que el archivo existe y se puede importar
        const types = require('../../types/visit.ts');
        expect(types).toBeDefined();

        // Verificamos que las funciones exportadas están disponibles
        expect(types.OPERATIONAL_HOURS).toBeDefined();
        expect(types.TIME_SLOTS_30MIN).toBeDefined();
        expect(types.formatRFC3339).toBeDefined();
        expect(types.generateIdempotencyKey).toBeDefined();
    });

    it('debería poder importar el hook', () => {
        const { useVisitScheduler } = require('../../hooks/useVisitScheduler.ts');
        expect(useVisitScheduler).toBeDefined();
        expect(typeof useVisitScheduler).toBe('function');
    });

    it('debería poder importar el componente', () => {
        const { QuintoAndarVisitScheduler } = require('../../components/flow/QuintoAndarVisitScheduler.tsx');
        expect(QuintoAndarVisitScheduler).toBeDefined();
        expect(typeof QuintoAndarVisitScheduler).toBe('function');
    });
});
