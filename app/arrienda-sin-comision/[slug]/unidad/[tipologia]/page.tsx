import { redirect } from "next/navigation";

interface UnidadPageProps {
    params: Promise<{
        slug: string;
        tipologia: string;
    }>;
}

export default async function UnidadPage({ params }: UnidadPageProps) {
    const { slug, tipologia } = await params;

    // Redirigir a la página principal del edificio con filtro de tipología
    redirect(`/property/${slug}?tipologia=${encodeURIComponent(tipologia)}`);
}
