'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ABTestProps {
    testId: string;
    variantA: ReactNode;
    variantB: ReactNode;
    defaultVariant?: 'A' | 'B';
    onVariantChange?: (variant: 'A' | 'B') => void;
}

export function ABTest({
    testId,
    variantA,
    variantB,
    defaultVariant = 'A',
    onVariantChange
}: ABTestProps) {
    const [variant, setVariant] = useState<'A' | 'B'>(defaultVariant);

    useEffect(() => {
        // Get stored variant or assign random
        const storedVariant = localStorage.getItem(`ab_test_${testId}`);

        if (storedVariant && (storedVariant === 'A' || storedVariant === 'B')) {
            setVariant(storedVariant);
        } else {
            // Random assignment (50/50)
            const randomVariant = Math.random() < 0.5 ? 'A' : 'B';
            localStorage.setItem(`ab_test_${testId}`, randomVariant);
            setVariant(randomVariant);
        }

        // Track test assignment
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'ab_test_assignment', {
                test_id: testId,
                variant: variant,
                event_category: 'experiment',
            });
        }

        // Callback
        if (onVariantChange) {
            onVariantChange(variant);
        }
    }, [testId, onVariantChange, variant]);

    // Track conversion when component is interacted with
    const trackConversion = () => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'ab_test_conversion', {
                test_id: testId,
                variant: variant,
                event_category: 'experiment',
            });
        }
    };

    // Add conversion tracking to variant content
    const variantWithTracking = (content: ReactNode) => {
        return (
            <div onClick={trackConversion}>
                {content}
            </div>
        );
    };

    return (
        <>
            {variant === 'A' ? variantWithTracking(variantA) : variantWithTracking(variantB)}
        </>
    );
}

// gtag interface is declared in Analytics.tsx

