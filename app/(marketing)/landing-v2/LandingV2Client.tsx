"use client";

import HeroV2 from '@/components/marketing/HeroV2';
import FeaturedGrid from '@/components/marketing/FeaturedGrid';
import HowItWorks from '@/components/marketing/HowItWorks';
import Trust from '@/components/marketing/Trust';
import { SearchFormProvider } from '@/components/marketing/SearchFormContext';

export default function LandingV2Client() {
    return (
        <SearchFormProvider>
            <main className="min-h-screen bg-white dark:bg-gray-900">
                <HeroV2 />
                <FeaturedGrid />
                <HowItWorks />
                <Trust />
            </main>
        </SearchFormProvider>
    );
}


