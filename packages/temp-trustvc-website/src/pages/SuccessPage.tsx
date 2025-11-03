import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate, useLocation } from "react-router-dom"

export default function SuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { ticketId } = location.state || {}

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Thank You!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {ticketId
              ? `Your support ticket ${ticketId} has been created successfully. We'll get back to you soon.`
              : "Your support request has been submitted successfully. We'll get back to you soon."
            }
          </p>
        </div>

        <Card className="bg-background/50 backdrop-blur-glass border border-border/50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Submission Successful</CardTitle>
            <CardDescription>
              Thank you for reaching out to us.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            {ticketId && (
              <p className="text-sm font-medium text-primary">
                Ticket ID: <span className="font-bold">{ticketId}</span>
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              You will receive an email confirmation shortly.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full max-w-xs bg-gradient-trust hover:opacity-90"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
