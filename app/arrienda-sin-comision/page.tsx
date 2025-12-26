import ArriendaSinComisionHero from "@/components/marketing/ArriendaSinComisionHero";
import ArriendaSinComisionGrid from "@/components/marketing/ArriendaSinComisionGrid";
import Benefits from "@/components/marketing/Benefits";
import HowItWorks from "@/components/marketing/HowItWorks";
import Trust from "@/components/marketing/Trust";
import StickyMobileCTA from "@/components/marketing/StickyMobileCTA";
import ContactModalWrapper from "@/components/marketing/ContactModalWrapper";

export default function ArriendaSinComisionPage() {
  return (
    <>
      <ArriendaSinComisionHero />
      <Benefits />
      <ArriendaSinComisionGrid />
      <HowItWorks />
      <Trust />
      <StickyMobileCTA />
      <ContactModalWrapper />
    </>
  );
}

