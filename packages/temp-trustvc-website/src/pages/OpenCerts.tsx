import { GraduationCap, Award, Users, Building, ArrowRight, CheckCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Award,
    title: "Tamper-Proof Certificates",
    description: "Blockchain-secured credentials that cannot be forged or altered"
  },
  {
    icon: Users,
    title: "Easy Verification",
    description: "Instant verification for employers, institutions, and students"
  },
  {
    icon: Building,
    title: "Institution Integration",
    description: "Seamless integration with existing student information systems"
  },
  {
    icon: BookOpen,
    title: "Multiple Formats",
    description: "Support for diplomas, transcripts, certificates, and micro-credentials"
  }
];

const institutions = [
  {
    name: "National University of Singapore",
    type: "University",
    certificates: "150K+",
    logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&h=100&fit=crop"
  },
  {
    name: "Singapore Institute of Technology", 
    type: "Technical Institute",
    certificates: "75K+",
    logo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop"
  },
  {
    name: "Nanyang Technological University",
    type: "University", 
    certificates: "200K+",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&h=100&fit=crop"
  },
  {
    name: "Republic Polytechnic",
    type: "Polytechnic",
    certificates: "95K+", 
    logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&h=100&fit=crop"
  }
];

const certificateTypes = [
  {
    title: "Academic Degrees",
    description: "Bachelor's, Master's, PhD, and professional degrees",
    count: "1.2M+"
  },
  {
    title: "Professional Certificates",
    description: "Industry certifications and professional qualifications",
    count: "500K+"
  },
  {
    title: "Micro-Credentials", 
    description: "Short courses, workshops, and skill-based certifications",
    count: "300K+"
  },
  {
    title: "Academic Transcripts",
    description: "Complete academic records and grade transcripts",
    count: "800K+"
  }
];

const benefits = [
  "Eliminate certificate fraud permanently",
  "Reduce verification time from weeks to seconds",
  "Lower administrative overhead by 70%", 
  "Provide lifetime access to graduates",
  "Enable global credential recognition",
  "Support mobile-first verification"
];

const OpenCerts = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-gradient-trust/10 text-primary border-primary/20">
            <GraduationCap className="h-3 w-3 mr-1" />
            OpenCerts Platform
          </Badge>
          <h1 className="text-6xl font-bold mb-8">
            Verifiable{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Educational Credentials
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            OpenCerts is the world's leading platform for issuing and verifying 
            tamper-proof educational certificates. Trusted by universities, 
            institutions, and employers globally for authentic credential verification.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-gradient-trust hover:opacity-90">
              Issue Certificates
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/support">Integration Guide</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 max-w-4xl mx-auto">
          {[
            { label: "Certificates Issued", value: "2.0M+" },
            { label: "Educational Institutions", value: "500+" },
            { label: "Countries", value: "65+" },
            { label: "Daily Verifications", value: "10K+" }
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
              Trusted by{" "}
              <span className="bg-gradient-trust bg-clip-text text-transparent">
                Educators Worldwide
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From small colleges to major universities, OpenCerts provides the 
              security and reliability institutions need for digital credentials.
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

        {/* Partner Institutions */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Partner Institutions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leading educational institutions worldwide trust OpenCerts for 
              their digital credential needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {institutions.map((institution) => (
              <Card 
                key={institution.name}
                className="text-center bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
              >
                <CardContent className="p-6">
                  <img
                    src={institution.logo}
                    alt={institution.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-semibold mb-2">{institution.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{institution.type}</p>
                  <Badge variant="outline" className="bg-gradient-trust/10 text-primary">
                    {institution.certificates} issued
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Certificate Types */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Supported Certificate Types</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From traditional degrees to modern micro-credentials, OpenCerts 
              supports all types of educational achievements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {certificateTypes.map((type) => (
              <Card 
                key={type.title}
                className="bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                    <Badge variant="outline" className="bg-gradient-trust/10 text-primary">
                      {type.count}
                    </Badge>
                  </div>
                  <CardDescription className="leading-relaxed">
                    {type.description}
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
                Revolutionize Your{" "}
                <span className="bg-gradient-trust bg-clip-text text-transparent">
                  Credential System
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join hundreds of institutions that have modernized their credential 
                systems with OpenCerts' secure and user-friendly platform.
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
                  Start Issuing Certificates
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop"
                alt="Educational Excellence"
                className="rounded-xl shadow-float"
              />
              <div className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-glass border border-border/50 rounded-xl p-6 shadow-float">
                <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Fraud Prevention Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-trust text-white text-center p-12">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">Ready to Go Digital?</CardTitle>
            <CardDescription className="text-white/90 text-lg max-w-2xl mx-auto">
              Transform your institution's credential system with OpenCerts. 
              Secure, verifiable, and trusted by institutions worldwide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Schedule Demo
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

export default OpenCerts;