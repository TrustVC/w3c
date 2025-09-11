import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Building,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const offices = [
  {
    title: "Infocomm Media Development Authority (IMDA)",
    address:
      "10 Pasir Panjang Rd,\n#03-01 Mapletree Business City\nSingapore 117438",
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Get in{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your document attestation process? Our team is
            here to help you in using TrustVC SDK for your organization.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-background/50 backdrop-blur-glass border border-border/50">
              <form name="contact-form" method="POST" data-netlify="true">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Send className="h-6 w-6 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+65 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="Company Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-100">
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="trade">
                            International Trade
                          </SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project, requirements or maybe the issue that you are facing..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-trust hover:opacity-90"
                    type="submit"
                  >
                    Send Message
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Locations */}
            <Card className="bg-background/50 backdrop-blur-glass border border-border/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Our Offices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {offices.map((office) => (
                  <div
                    key={office.title}
                    className="pb-4 border-b border-border/30 last:border-b-0 last:pb-0"
                  >
                    <div className="font-semibold text-primary mb-1">
                      {office.title}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1 whitespace-pre-line">
                      {office.address}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
