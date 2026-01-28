import { Metadata } from "next";
import { SellPropertyForm } from "@/components/tree/SellPropertyForm";

export const metadata: Metadata = {
  title: "Vender mi Propiedad | Elkis Realtor",
  description: "Asesoría para venta de propiedades. Completa el formulario y te contactaremos pronto.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function SellPropertyPage() {
  return <SellPropertyForm />;
}
