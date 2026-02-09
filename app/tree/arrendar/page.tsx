import { Metadata } from "next";
import { RentFormStepper } from "@/components/tree/RentFormStepper";

export const metadata: Metadata = {
  title: "Quiero Arrendar | Elkis Realtor",
  description: "Completa el formulario paso a paso y encuentra tu próximo hogar.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ArrendarPage() {
  return <RentFormStepper />;
}
