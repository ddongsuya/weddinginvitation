import { EnvelopeIntro } from "./components/EnvelopeIntro";
import { OpeningCinematic } from "./components/OpeningCinematic";
import { InvitationSection } from "./components/InvitationSection";
import { CalendarSection } from "./components/CalendarSection";
import { GallerySection } from "./components/GallerySection";
import { MapSection } from "./components/MapSection";
import { AccountSection } from "./components/AccountSection";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <main className="relative mx-auto min-h-screen max-w-invitation bg-background shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <OpeningCinematic />
        <InvitationSection />
        <CalendarSection />
        <GallerySection />
        <MapSection />
        <AccountSection />
        <Footer />
      </main>
      <EnvelopeIntro />
    </>
  );
}
