'use client';

/**
 * 🎨 IconDemo - Componente de Demostración del Sistema de Íconos
 * 
 * Componente que muestra todas las funcionalidades del sistema de íconos
 * glass minimal con ejemplos interactivos.
 */

import React from 'react';
import { useIconActions, useIconConfig } from './IconProvider';
import { Icon, IconButton, IconLink, IconBadge } from './Icon';
import { AVAILABLE_ICONS, AVAILABLE_SIZES, AVAILABLE_STROKES, AVAILABLE_VARIANTS } from './index';

/**
 * Componente de demostración del sistema de íconos
 */
export function IconDemo() {
    const { setPreset, toggleGlassEffects, toggleAnimations } = useIconActions();
    const config = useIconConfig();

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">🎨 Sistema de Íconos Glass</h1>

            {/* Controles */}
            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={() => setPreset('light')}
                    className={`px-4 py-2 rounded-lg ${config.preset === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Light
                </button>
                <button
                    onClick={() => setPreset('dark')}
                    className={`px-4 py-2 rounded-lg ${config.preset === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Dark
                </button>
                <button
                    onClick={() => setPreset('brand')}
                    className={`px-4 py-2 rounded-lg ${config.preset === 'brand' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Brand
                </button>
                <button
                    onClick={toggleGlassEffects}
                    className={`px-4 py-2 rounded-lg ${config.enableGlassEffects ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                >
                    Glass: {config.enableGlassEffects ? 'ON' : 'OFF'}
                </button>
                <button
                    onClick={toggleAnimations}
                    className={`px-4 py-2 rounded-lg ${config.enableAnimations ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                >
                    Animations: {config.enableAnimations ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Demostración de íconos */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {AVAILABLE_ICONS.map(name => (
                    <div key={name} className="text-center space-y-2">
                        <Icon name={name} size="lg" />
                        <p className="text-sm font-medium">{name}</p>
                    </div>
                ))}
            </div>

            {/* Variantes */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Variantes</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {AVAILABLE_VARIANTS.map(variant => (
                        <div key={variant} className="text-center space-y-2">
                            <Icon name="heart" variant={variant} size="lg" />
                            <p className="text-sm font-medium">{variant}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tamaños */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tamaños</h2>
                <div className="flex items-center gap-4">
                    {AVAILABLE_SIZES.map(size => (
                        <div key={size} className="text-center space-y-2">
                            <Icon name="settings" size={size} />
                            <p className="text-xs font-medium">{size}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strokes */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Strokes</h2>
                <div className="flex items-center gap-4">
                    {AVAILABLE_STROKES.map(stroke => (
                        <div key={stroke} className="text-center space-y-2">
                            <Icon name="check" stroke={stroke} size="lg" />
                            <p className="text-xs font-medium">{stroke}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Componentes especializados */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Componentes Especializados</h2>
                <div className="flex items-center gap-4">
                    <IconButton name="heart" onClick={() => alert('Heart clicked!')} />
                    <IconLink name="settings" href="/settings" />
                    <IconBadge name="check" badge="3" />
                </div>
            </div>
        </div>
    );
}
