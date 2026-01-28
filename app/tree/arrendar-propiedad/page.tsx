import { Metadata } from "next";
import { RentPropertyForm } from "@/components/tree/RentPropertyForm";

export const metadata: Metadata = {
  title: "Arrendar mi Propiedad | Elkis Realtor",
  description: "Publica tu propiedad sin comisión. Completa el formulario y te contactaremos pronto.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RentPropertyPage() {
  return <RentPropertyForm />;
}
