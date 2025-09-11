import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const newsItems = [
  {
    id: 1,
    title: "TrustVC 3.0 Released with Enhanced Security Features",
    excerpt: "Major update includes new cryptographic protocols and improved performance for large-scale deployments.",
    category: "Product Update",
    date: "2024-01-15",
    readTime: "5 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=300&fit=crop"
  },
  {
    id: 2, 
    title: "Partnership with Singapore Maritime Authority",
    excerpt: "Strategic partnership to digitize trade documentation across Southeast Asian shipping routes.",
    category: "Partnership",
    date: "2024-01-10", 
    readTime: "3 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=300&fit=crop"
  },
  {
    id: 3,
    title: "OpenCerts Reaches 2 Million Verified Certificates",
    excerpt: "Educational institutions worldwide have now issued over 2 million verified digital certificates.",
    category: "Milestone",
    date: "2024-01-05",
    readTime: "2 min read", 
    featured: false,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=300&fit=crop"
  },
  {
    id: 4,
    title: "E-Apostilles Framework Development Update",
    excerpt: "Progress on digital apostille implementation with legal frameworks from 15 countries.",
    category: "Development",
    date: "2024-01-01",
    readTime: "4 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=300&fit=crop"
  },
  {
    id: 5,
    title: "Developer Conference 2024 Announced",
    excerpt: "Join us for TrustVC Dev Con 2024 featuring workshops, networking, and product previews.",
    category: "Event",
    date: "2023-12-28",
    readTime: "2 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop"
  }
];

const News = () => {
  const featuredNews = newsItems.find(item => item.featured);
  const regularNews = newsItems.filter(item => !item.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            News &{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Updates
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay up to date with the latest TrustVC developments, partnerships, 
            and industry insights in the verifiable credentials space.
          </p>
        </div>

        {/* Featured Article */}
        {featuredNews && (
          <Card className="mb-12 overflow-hidden bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300">
            <div className="grid lg:grid-cols-2">
              <div className="relative overflow-hidden">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="w-full h-full min-h-[300px] object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-gradient-trust">
                  Featured
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {featuredNews.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredNews.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {featuredNews.readTime}
                  </div>
                </div>
                <CardTitle className="text-3xl mb-4">{featuredNews.title}</CardTitle>
                <CardDescription className="text-lg mb-6 leading-relaxed">
                  {featuredNews.excerpt}
                </CardDescription>
                <Button className="self-start bg-gradient-trust hover:opacity-90">
                  Read Full Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Regular Articles */}
        <div className="grid md:grid-cols-2 gap-8">
          {regularNews.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge
                  variant="outline"
                  className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {item.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.readTime}
                  </div>
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="mb-4 leading-relaxed">
                  {item.excerpt}
                </CardDescription>
                <Button variant="ghost" className="group/btn p-0 h-auto hover:bg-transparent">
                  <span className="flex items-center gap-2 text-primary font-medium">
                    Read More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default News;