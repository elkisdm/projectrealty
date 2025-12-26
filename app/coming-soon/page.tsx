import type { Metadata } from "next";
import { ComingSoonClient } from '@components/marketing/ComingSoonClient';

export const metadata: Metadata = {
  title: "Próximamente - Elkis Realtor",
  description: "Estamos preparando la nueva experiencia de arriendo 0% comisión. Sin letra chica.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComingSoonPage() {
  return <ComingSoonClient />;
}
