import CalendarVisitFlow from '@/components/calendar/CalendarVisitFlow';

// Datos de prueba
const MOCK_BUILDING = {
    id: 'test-building-1',
    name: 'Edificio Premium Las Condes',
    address: 'Av. Apoquindo 1234, Las Condes, Santiago',
    units: [
        {
            id: 'A-101',
            tipologia: '2D1B',
            superficie: 65,
            precio: 850000,
            disponible: true,
            piso: 1,
            orientacion: 'Norte',
            amenities: ['Estacionamiento', 'Bodega', 'Terraza']
        },
        {
            id: 'A-102',
            tipologia: '3D2B',
            superficie: 85,
            precio: 1200000,
            disponible: true,
            piso: 1,
            orientacion: 'Norte',
            amenities: ['Estacionamiento', 'Bodega', 'Terraza', 'Loggia']
        }
    ]
} as any;

const MOCK_UNIT = MOCK_BUILDING.units[0];

export default function TestCalendarPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-center">
                    Test Calendario de Visitas
                </h1>

                <CalendarVisitFlow
                    building={MOCK_BUILDING}
                    unit={MOCK_UNIT}
                    date="2024-01-15"
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl"
                />
            </div>
        </div>
    );
}
