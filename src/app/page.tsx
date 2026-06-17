import Navbar        from "@/components/Navbar";
import HeroParticleAlt from "@/components/HeroParticleAlt";
import WebServices    from "@/components/WebServices";
import TechStackSection from "@/components/TechStackSection";
import AISolutions    from "@/components/AISolutions";
import ProblemsSolved from "@/components/ProblemsSolved";
import Portfolio      from "@/components/Portfolio";
import WhyUs          from "@/components/WhyUs";
import WorkProcess    from "@/components/WorkProcess";
import AboutUs        from "@/components/AboutUs";
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
        <AISolutions />
        <ProblemsSolved />
        <Portfolio />
        <WhyUs />
        <WorkProcess />
        <AboutUs />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
