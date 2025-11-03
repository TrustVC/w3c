import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/components/ui/sonner"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Trash2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).min(1, { message: "Email is required." }),
  summary: z.string().min(1, { message: "Summary is required." }),
  description: z.string().optional(),
  whereEncountered: z.array(z.string()).optional(),
})

const whereOptions = [
  "TradeTrust Reference Website",
  "TradeTrust Documentation Website",
  "TradeTrust Gallery",
  "TradeTrust Library",
  "TrustVC Website",
  "OpenCerts Website",
  "TrustVC SDK",
  "Other"
]

export default function Support() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      summary: "",
      description: "",
      whereEncountered: [],
    },
  })

  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      // Append new files to existing ones instead of replacing
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
      
      // Clear the input so the same file can be selected again if needed
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    
    // Update the file input
    if (fileRef.current) {
      const dt = new DataTransfer()
      newFiles.forEach(file => dt.items.add(file))
      fileRef.current.files = dt.files
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email, summary, description, whereEncountered } = values;
    
    // Use description as is
    const fullDescription = description || '';
  
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('email', email);
      formData.append('summary', summary);
      formData.append('description', fullDescription);
      
      // Convert whereEncountered to array of objects with value property
      const platformData = (whereEncountered || []).map(item => ({ value: item }));
      formData.append('platform', JSON.stringify(platformData));

      // Add file attachments
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('attachments', file);
        });
      }
  
      // Show loading state
      toast.success('Submitting your request...');
      
      // Submit to AWS API endpoint
      const response = await fetch('https://nrw2toa8ed.execute-api.ap-southeast-1.amazonaws.com/dev/service-request', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        const ticketId = data.data?.serviceRequest?.issueKey || 'Unknown';
        const message = data.data?.message || 'Ticket created successfully!';
        const attachmentCount = data.data?.attachmentsUploaded || 0;
        
        toast.success(`${message}${attachmentCount > 0 ? ` (${attachmentCount} attachments uploaded)` : ''}`);
        navigate("/support/success", { state: { ticketId, webUrl: data.data?.serviceRequest?.webUrl } });
      } else {
        // Handle the actual error response format
        const errorMessage = data.error?.message || data.message || data.error || 'Failed to create ticket';
        console.error('API Error:', data);
        toast.error(errorMessage);
        navigate("/support/error", { state: { error: data.error || data } });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network error. Please try again.');
      navigate("/support/error");
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Support{" "}
            <span className="bg-gradient-trust bg-clip-text text-transparent">
              Request
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get help with TrustVC products and services. 
            We'll get back to you as soon.
          </p>
        </div>

        <Card className="bg-background/50 backdrop-blur-glass border border-border/50 max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              <CardHeader>
                <CardTitle className="text-2xl">Submit a Request</CardTitle>
                <CardDescription>
                  Fill out the form below to create a new support ticket.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide detailed information about your issue..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whereEncountered"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where was this encountered?</FormLabel>
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {whereOptions.map((option) => (
                              <FormItem
                                key={option}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), option])
                                        : field.onChange(
                                            (field.value || []).filter((value) => value !== option)
                                          );
                                    }}
                                    className="h-4 w-4 !rounded-none border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    style={{ borderRadius: '2px' }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Attachment</FormLabel>
                    <FormControl>
                      <div 
                        className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-primary transition-colors cursor-pointer"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Input
                          ref={fileRef}
                          type="file"
                          multiple
                          className="hidden"
                          id="attachments"
                          onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-500">📎</span>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Drag and drop files, paste screenshots, or browse
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Please provide screenshot of the issue/error
                          </p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent double-click from outer div
                              fileRef.current?.click();
                            }}
                          >
                            Browse
                          </Button>
                        </div>
                        {selectedFiles.length > 0 && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-foreground">
                                Attached Files ({selectedFiles.length})
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFiles([]);
                                  if (fileRef.current) {
                                    fileRef.current.value = '';
                                  }
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Clear All
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {selectedFiles.map((file, index) => (
                                <div 
                                  key={index} 
                                  className="group flex items-center gap-3 p-3 bg-background/50 backdrop-blur-glass border border-border/50 rounded-lg hover:shadow-sm transition-all duration-200"
                                >
                                  {/* File Icon */}
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-trust rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">📄</span>
                                  </div>
                                  
                                  {/* File Info */}
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-foreground truncate text-left">
                                      {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground capitalize">
                                        {file.type || 'Unknown type'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFile(index);
                                    }}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-trust hover:opacity-90"
                    disabled={form.formState.isSubmitting}
                  >
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}