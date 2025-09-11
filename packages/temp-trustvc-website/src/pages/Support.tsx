import { Book, Code, MessageCircle, FileText, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const documentationSections = [
  {
    title: "Getting Started",
    description: "Quick start guides and basic concepts",
    icon: Book,
    items: [
      "Installation & Setup",
      "Your First Document",
      "Basic Verification",
      "Configuration Guide"
    ]
  },
  {
    title: "API Reference", 
    description: "Complete API documentation",
    icon: Code,
    items: [
      "Authentication",
      "Document Creation", 
      "Verification Methods",
      "Webhook Events"
    ]
  },
  {
    title: "SDKs & Libraries",
    description: "Language-specific implementations", 
    icon: FileText,
    items: [
      "JavaScript/TypeScript",
      "Python SDK",
      "Java Library",
      "REST API"
    ]
  }
];

const communityResources = [
  {
    title: "GitHub Repository",
    description: "Source code, issues, and contributions",
    icon: Code,
    link: "https://github.com/trustvc"
  },
  {
    title: "Community Forum",
    description: "Ask questions and get help from the community", 
    icon: MessageCircle,
    link: "#"
  },
  {
    title: "Developer Blog",
    description: "Latest updates, tutorials, and best practices",
    icon: FileText,
    link: "#"
  }
];

const Support = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            TrustVC{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to integrate TrustVC into your applications. 
            Comprehensive guides, API references, and community resources.
          </p>
        </div>

        <Tabs defaultValue="documentation" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-12 bg-background/50 backdrop-blur-glass">
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="documentation">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {documentationSections.map((section) => (
                <Card 
                  key={section.title}
                  className="group bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-trust p-2.5 mb-4">
                      <section.icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                          <ChevronRight className="h-3 w-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutorials">
            <div className="space-y-8">
              <Card className="bg-background/50 backdrop-blur-glass border border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Interactive Tutorials</CardTitle>
                  <CardDescription>
                    Step-by-step guides to get you started with TrustVC
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    "Building Your First Verifiable Document",
                    "Integrating TradeTrust in E-commerce",
                    "Setting Up OpenCerts for Educational Institutions", 
                    "Advanced Cryptographic Verification"
                  ].map((tutorial, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-trust flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{tutorial}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Start Tutorial
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <div className="grid md:grid-cols-3 gap-8">
              {communityResources.map((resource) => (
                <Card 
                  key={resource.title}
                  className="group bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-trust p-2.5 mb-4">
                      <resource.icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {resource.title}
                      <ExternalLink className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full group-hover:bg-gradient-trust group-hover:text-white transition-all">
                      Visit Resource
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;