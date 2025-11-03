import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-destructive">
            Submission Failed
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            There was an error submitting your support request. Please try again.
          </p>
        </div>

        <Card className="bg-background/50 backdrop-blur-glass border border-border/50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Error</CardTitle>
            <CardDescription>
              Something went wrong. Please try submitting your request again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button 
              onClick={() => navigate("/support")}
              className="w-full max-w-xs bg-gradient-trust hover:opacity-90"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
