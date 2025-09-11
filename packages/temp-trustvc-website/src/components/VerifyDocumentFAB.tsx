import { useState } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const VerifyDocumentFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isExpanded && (
        <Card className="mb-4 w-80 bg-background/95 backdrop-blur-glass border border-border/50 shadow-float animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Verification</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Document</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <Shield className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & Drop TrustVC Document to Verify
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Or Enter Document URL</label>
              <Input placeholder="https://" />
            </div>
            <Button className="w-full bg-gradient-trust">Verify Now</Button>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col items-center">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "rounded-full h-16 w-16 shadow-float animate-float",
            "bg-gradient-trust hover:opacity-90 transition-all duration-300",
            isExpanded && "rotate-45"
          )}
        >
          <Shield className="h-6 w-6" />
        </Button>
        
        {!isExpanded && (
          <div className="mt-2">
            <div className="bg-background/95 backdrop-blur-glass border border-border/50 rounded px-2 py-1 text-xs font-medium shadow-glass">
              Verify Document
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyDocumentFAB;