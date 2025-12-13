'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console -- Error boundary logging
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Algo salió mal
                </h2>
                <p className="text-gray-600 mb-6">
                    No pudimos cargar la página. Por favor, intenta de nuevo.
                </p>
                <button
                    onClick={reset}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
                >
                    Intentar de nuevo
                </button>
            </div>
        </div>
    );
}
