import Navbar        from "@/components/Navbar";
import HeroParticleAlt from "@/components/HeroParticleAlt";
import WebServices    from "@/components/WebServices";
import TechStackSection from "@/components/TechStackSection";
import Portfolio      from "@/components/Portfolio";
import ScrollTextLines from "@/components/ScrollTextLines";
import WhyUs          from "@/components/WhyUs";
import WorkProcess    from "@/components/WorkProcess";
import FinalCTA       from "@/components/FinalCTA";
import Footer         from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <Navbar />
      <main>
        <HeroParticleAlt />
        <WebServices />
        <TechStackSection />
        <Portfolio />
        <ScrollTextLines />
        <WhyUs />
        <WorkProcess />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
