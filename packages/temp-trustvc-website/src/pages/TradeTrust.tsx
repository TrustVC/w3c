import { Shield, Truck, FileCheck, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Cryptographic Security",
    description: "Military-grade encryption ensures document integrity and authenticity"
  },
  {
    icon: Globe,
    title: "Global Standards",
    description: "Compliant with international trade regulations and standards"
  },
  {
    icon: FileCheck,
    title: "Instant Verification",
    description: "Real-time document verification across supply chains"
  },
  {
    icon: Truck,
    title: "Supply Chain Integration",
    description: "Seamless integration with existing logistics systems"
  }
];

const useCases = [
  {
    title: "Bill of Lading",
    description: "Digital bills of lading with tamper-proof verification",
    stats: "500K+ processed"
  },
  {
    title: "Commercial Invoice", 
    description: "Secure commercial invoices for international trade",
    stats: "1M+ verified"
  },
  {
    title: "Certificate of Origin",
    description: "Authenticated certificates of origin for customs clearance", 
    stats: "300K+ issued"
  },
  {
    title: "Packing List",
    description: "Verified packing lists for accurate cargo documentation",
    stats: "750K+ documents"
  }
];

const benefits = [
  "Reduce document fraud by 99.9%",
  "Cut verification time from hours to seconds", 
  "Lower administrative costs by 60%",
  "Improve supply chain transparency",
  "Enable paperless trade workflows",
  "Ensure regulatory compliance"
];

const TradeTrust = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-gradient-trust/10 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            TradeTrust Framework
          </Badge>
          <h1 className="text-6xl font-bold mb-8">
            Secure Trade{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Document Verification
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            TradeTrust is an open-source framework that enables the creation of 
            tamper-proof digital trade documents. Built on blockchain technology, 
            it ensures document integrity and authenticity across global supply chains.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-gradient-trust hover:opacity-90">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/support">View Documentation</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 max-w-4xl mx-auto">
          {[
            { label: "Documents Processed", value: "500K+" },
            { label: "Active Traders", value: "10K+" },
            { label: "Countries Supported", value: "50+" },
            { label: "Uptime Guarantee", value: "99.9%" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose{" "}
              <span className="bg-gradient-trust bg-clip-text text-transparent">
                TradeTrust?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced security meets practical usability in a framework designed 
              for the modern global trade ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="text-center bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-trust p-3 mx-auto mb-4">
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Supported Document Types</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              TradeTrust supports all major trade document types with industry-specific 
              templates and validation rules.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase) => (
              <Card 
                key={useCase.title}
                className="bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    <Badge variant="outline" className="bg-gradient-trust/10 text-primary">
                      {useCase.stats}
                    </Badge>
                  </div>
                  <CardDescription className="leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Transform Your{" "}
                <span className="bg-gradient-trust bg-clip-text text-transparent">
                  Trade Operations
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join leading organizations worldwide who have already digitized their 
                trade documentation processes with TradeTrust.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" className="bg-gradient-trust hover:opacity-90">
                  Start Implementation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop"
                alt="Global Trade Network"
                className="rounded-xl shadow-float"
              />
              <div className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-glass border border-border/50 rounded-xl p-6 shadow-float">
                <div className="text-2xl font-bold text-primary mb-1">2.5M+</div>
                <div className="text-sm text-muted-foreground">Documents Secured</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-trust text-white text-center p-12">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">Ready to Get Started?</CardTitle>
            <CardDescription className="text-white/90 text-lg max-w-2xl mx-auto">
              Implement TradeTrust in your organization today and join the future 
              of secure, verifiable trade documentation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Contact Sales
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Technical Documentation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradeTrust;