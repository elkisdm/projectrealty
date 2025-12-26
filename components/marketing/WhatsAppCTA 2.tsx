"use client";

import Link from "next/link";
import { trackWhatsAppClick } from "@/components/marketing/ConversionTracker";

interface WhatsAppCTAProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    position: string;
    plan?: string;
    price?: number;
}

export function WhatsAppCTA({
    href,
    children,
    className = "",
    position,
    plan = "base",
    price = 50
}: WhatsAppCTAProps) {
    const handleClick = () => {
        trackWhatsAppClick(position, plan, price);
    };

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={className}
            data-analytics="cta_whatsapp_click"
            data-position={position}
            data-plan={plan}
            data-price={price}
        >
            {children}
        </Link>
    );
}
