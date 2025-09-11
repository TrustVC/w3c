import { Code, GitBranch, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const developerFeatures = [
  "Quick Integration: Simple SDK with TypeScript support and comprehensive examples",
  "Full Documentation: Step by step guide with real-world examples",
  "Open Source: Transparent roadmap and community contributions",
  "Backwards-compatible: Verify existing .oa documents while you migrate to W3C VC",
];

const DeveloperSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid max-w-6xl justify-center gap-16 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-trust p-2">
                <Code className="w-full h-full text-white" />
              </div>
              <h2 className="text-4xl font-bold">
                Built for Developers,{" "}
                <span className="bg-gradient-trust bg-clip-text text-transparent">
                  Trusted by Enterprises
                </span>
              </h2>
            </div>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Get started in minutes with our comprehensive documentation.
              TrustVC abstracts away the complexity while maintaining full
              control and transparency.
            </p>

            <ul className="space-y-4 mb-8">
              {developerFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-trust hover:opacity-90"
              >
                <a
                  href="https://docs.tradetrust.io/docs/migration-guide/trustvc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TrustVC Documentation
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://github.com/trustvc/trustvc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
