import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const heroVariants = [
  {
    rollingWord: "Trustworthy",
    subtitle: "All",
    stats: [
      { label: "Documents Verified", value: "2.05M+" },
      { label: "Active Users", value: "510K+" },
      { label: "Organizations", value: "50+" },
      { label: "Countries", value: "20+" },
    ],
  },
  {
    rollingWord: "Trade",
    subtitle: "TradeTrust",
    stats: [
      { label: "Documents Verified", value: "50K+" },
      { label: "Active Users", value: "10K+" },
      { label: "Organizations", value: "20+" },
      { label: "Countries", value: "10+" },
    ],
  },
  {
    rollingWord: "Academic",
    subtitle: "OpenCerts",
    stats: [
      { label: "Documents Verified", value: "2.0M+" },
      { label: "Active Users", value: "500K+" },
      { label: "Organizations", value: "30+" },
      { label: "Countries", value: "SG" },
    ],
  },
  {
    rollingWord: "Legal",
    subtitle: "E-Apostilles",
    stats: [{ label: "Coming Soon", value: "" }],
  },
];

const HeroSection = () => {
  const [currentVariant, setCurrentVariant] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentVariant((prev) => (prev + 1) % heroVariants.length);
        setIsAnimating(false);
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const variant = heroVariants[currentVariant];

  const handleTabClick = (index: number) => {
    if (index !== currentVariant) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentVariant(index);
        setIsAnimating(false);
      }, 200);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-trust-blue/5 to-trust-indigo/10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-trust-blue/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-trust-indigo/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-trust-purple/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-4">
            <span className="block">Simple </span>
            <span
              className={cn(
                "block transition-all duration-500",
                isAnimating
                  ? "opacity-0 transform -translate-y-4"
                  : "opacity-100 transform translate-y-0"
              )}
            >
              <span className="bg-gradient-trust bg-clip-text text-transparent">
                {variant.rollingWord}
              </span>
            </span>
            <span className="block">Verifiable Credentials</span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          One SDK, multiple verification systems. Instantly verify trade
          documents, academic certificates, and legal apostilles powered by
          decentralized ledger technology and open standards for digital trust.
        </p>

        {/* Tabs, Stats and Growth Container */}
        <div className="bg-background/30 backdrop-blur-glass border border-border/30 rounded-2xl p-8 max-w-5xl mx-auto shadow-glass">
          {/* Toggle Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-background/40 backdrop-blur-glass rounded-full border border-border/30 p-1">
              {heroVariants.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    currentVariant === index
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {tab.subtitle}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div
            className={cn(
              "transition-all duration-500 mb-6",
              isAnimating
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            )}
          >
            {variant.subtitle === "E-Apostilles" ? (
              <div className="flex justify-center">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    Coming Soon
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {variant.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
