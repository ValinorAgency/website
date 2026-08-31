import Navbar        from "@/components/Navbar";
import HeroParticleAlt from "@/components/HeroParticleAlt";
import TechStackSection from "@/components/TechStackSection";
import Portfolio      from "@/components/Portfolio";
import ScrollTextLines from "@/components/ScrollTextLines";
import WhyUs          from "@/components/WhyUs";
import TeamSection    from "@/components/TeamSection";
import FinalCTA       from "@/components/FinalCTA";
import Footer         from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <Navbar />
      <main>
        <HeroParticleAlt />
        <Portfolio />
        <TechStackSection />
        <ScrollTextLines />
        <WhyUs />
        <TeamSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
