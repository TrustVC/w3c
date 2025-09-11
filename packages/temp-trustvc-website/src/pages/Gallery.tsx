import { useState } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const galleryItems = [
  {
    id: 1,
    title: "Digital Trade Certificate",
    category: "TradeTrust",
    type: "Trade Document", 
    status: "Verified",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    description: "International trade certificate verified using TradeTrust framework"
  },
  {
    id: 2,
    title: "University Diploma",
    category: "OpenCerts",
    type: "Academic",
    status: "Verified", 
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
    description: "Bachelor's degree certificate from National University of Singapore"
  },
  {
    id: 3,
    title: "Professional Certificate",
    category: "OpenCerts",
    type: "Professional",
    status: "Verified",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop", 
    description: "Professional certification in blockchain technology"
  },
  {
    id: 4,
    title: "Bill of Lading",
    category: "TradeTrust", 
    type: "Shipping",
    status: "Verified",
    thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
    description: "Electronic bill of lading for container shipment"
  },
  {
    id: 5,
    title: "Legal Apostille",
    category: "E-Apostilles",
    type: "Legal",
    status: "Coming Soon",
    thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop",
    description: "Digital apostille for international legal document authentication"
  },
  {
    id: 6,
    title: "Medical Certificate", 
    category: "OpenCerts",
    type: "Medical",
    status: "Verified",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
    description: "Medical practitioner certificate verification"
  }
];

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "TradeTrust", "OpenCerts", "E-Apostilles"];

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Document{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore verified documents across different domains. See how TrustVC 
            transforms document verification for various industries and use cases.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-glass border border-border/50"
            />
          </div>
          <div className="flex gap-2">
            <Filter className="h-5 w-5 text-muted-foreground mt-2.5 md:mt-2.5" />
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gradient-trust" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredItems.map((item) => (
            <Card 
              key={item.id}
              className="group overflow-hidden bg-background/50 backdrop-blur-glass border border-border/50 hover:shadow-float transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
                <Badge
                  variant={item.status === "Verified" ? "default" : "secondary"}
                  className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
                >
                  {item.status}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No documents found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;