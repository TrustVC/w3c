import { ArrowRight, Shield, GraduationCap, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Shield,
    title: "TradeTrust",
    description:
      "An open-source framework for digital trade documents. It allows trading partners to create, exchange, verify digitised documents, and transfer ownership of documents across different digital platforms seamlessly.",
    link: "https://tradetrust.io",
    available: true,
    gradientClass: "bg-gradient-tradetrust",
  },
  {
    icon: GraduationCap,
    title: "OpenCerts",
    description:
      "OpenCerts is an open-source framework which education institutions can adopt for issuing certificates. Verify academic certificates, diplomas, and professional certifications instantly.",
    link: "https://opencerts.io",
    available: true,
    gradientClass: "bg-gradient-opencerts",
  },
  {
    icon: Scale,
    title: "E-Apostilles",
    description:
      "A digital certificate of authenticity for public documents, launched by the Singapore Academy of Law (SAL) in partnership with IMDA in June 2025 to simplify and secure cross-border legal notarisation.",
    link: "#",
    available: false,
    gradientClass: "bg-gradient-apostilles",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by Industries{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Multiple specialized frameworks, one powerful engine. See how
            TrustVC powers verification across industries and transforms how the
            world handles digital documents.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="group relative overflow-hidden bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
            >
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 ${service.gradientClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <CardHeader className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-lg ${service.gradientClass} p-2.5 mb-4`}
                >
                  <service.icon className="w-full h-full text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                {service.available ? (
                  <Button
                    asChild
                    variant="ghost"
                    className="group/btn p-0 h-auto hover:bg-transparent"
                  >
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary font-medium"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="ghost"
                    className="p-0 h-auto cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      Coming Soon
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
