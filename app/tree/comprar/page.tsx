import { Metadata } from "next";
import { BuyForm } from "@/components/tree/BuyForm";

export const metadata: Metadata = {
  title: "Quiero Comprar | Elkis Realtor",
  description: "Completa el formulario de inversión inmobiliaria y recibe una propuesta estimada en menos de 24h.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ComprarPage() {
  return <BuyForm />;
}
