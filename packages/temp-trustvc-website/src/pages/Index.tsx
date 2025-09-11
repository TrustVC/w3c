import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import DeveloperSection from "@/components/DeveloperSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ServicesSection />
      <DeveloperSection />
    </div>
  );
};

export default Index;
