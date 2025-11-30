'use client';

import { useEffect } from 'react';

interface AnalyticsProps {
    pageName: string;
    conversionGoal?: string;
}

export function Analytics({ pageName, conversionGoal = 'flash_offer_conversion' }: AnalyticsProps) {
    useEffect(() => {
        // Track page view
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: pageName,
                page_location: window.location.href,
            });
        }

        // Track custom event
        const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', eventName, {
                    event_category: 'engagement',
                    event_label: pageName,
                    ...parameters,
                });
            }
        };

        // Track scroll depth
        let maxScroll = 0;
        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                // Track scroll milestones
                if (maxScroll >= 25 && maxScroll < 50) {
                    trackEvent('scroll_25_percent');
                } else if (maxScroll >= 50 && maxScroll < 75) {
                    trackEvent('scroll_50_percent');
                } else if (maxScroll >= 75 && maxScroll < 100) {
                    trackEvent('scroll_75_percent');
                } else if (maxScroll >= 100) {
                    trackEvent('scroll_100_percent');
                }
            }
        };

        // Track time on page
        let startTime = Date.now();
        const trackTimeOnPage = () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);

            if (timeOnPage >= 30 && timeOnPage < 60) {
                trackEvent('time_on_page_30s');
            } else if (timeOnPage >= 60 && timeOnPage < 120) {
                trackEvent('time_on_page_1min');
            } else if (timeOnPage >= 120) {
                trackEvent('time_on_page_2min');
            }
        };

        // Track CTA clicks
        const trackCTAClick = (ctaType: string) => {
            trackEvent('cta_click', {
                cta_type: ctaType,
                conversion_goal: conversionGoal,
            });
        };

        // Add event listeners
        window.addEventListener('scroll', trackScroll);

        // Track time intervals
        const timeInterval = setInterval(trackTimeOnPage, 30000); // Every 30 seconds

        // Track CTA clicks
        const ctaButtons = document.querySelectorAll('[data-cta]');
        ctaButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const ctaType = button.getAttribute('data-cta') || 'unknown';
                trackCTAClick(ctaType);
            });
        });

        // Cleanup
        return () => {
            window.removeEventListener('scroll', trackScroll);
            clearInterval(timeInterval);

            ctaButtons.forEach((button) => {
                button.removeEventListener('click', () => { });
            });
        };
    }, [pageName, conversionGoal]);

    return null; // This component doesn't render anything
}

// gtag interface is declared in types/global.d.ts

