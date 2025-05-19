import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateMarketingContent } from "@/lib/api";
import { Clipboard, Loader2, Download, ArrowRight, Instagram, Facebook, Search, SpeechIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contentGenerationSchema = z.object({
  type: z.string({
    required_error: "Please select a content type",
  }),
  serviceId: z.string().optional(),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

type FormValues = z.infer<typeof contentGenerationSchema>;

export default function AiMarketing() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  
  // Get services for dropdown
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Get previous marketing content
  const { data: marketingContents, isLoading } = useQuery({
    queryKey: ['/api/marketing'],
  });
  
  // Generate marketing content mutation
  const generateContentMutation = useMutation({
    mutationFn: generateMarketingContent,
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "Content generated",
        description: "Your marketing content has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(contentGenerationSchema),
    defaultValues: {
      type: "",
      serviceId: "",
      prompt: "",
    },
  });
  
  function onSubmit(data: FormValues) {
    setGeneratedContent(null);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Sample AI-generated content based on prompt type
      let content = "";
      
      if (data.type === "instagram") {
        content = `✨ Paradise awaits at our beautiful beachfront villa! 🌊 Enjoy stunning ocean views, private access to crystal clear waters, and the most mesmerizing sunsets you've ever seen. Book your dream vacation today! #IslandLife #TropicalParadise #LuxuryStay`;
      } else if (data.type === "facebook") {
        content = `Looking for the perfect getaway? Our villa offers everything you need for an unforgettable vacation. Spacious rooms, private pool, and just steps from the beach. Limited availability for the summer season - book now to secure your dates!`;
      } else if (data.type === "seo") {
        content = `Experience luxury beachfront accommodations in Sri Lanka with our exclusive villa rentals. Perfect for families and couples seeking privacy, stunning ocean views, and world-class amenities. Our properties feature private pools, air conditioning, and personalized concierge service to ensure your tropical getaway exceeds all expectations.`;
      }
      
      setGeneratedContent(content);
    }, 2000);
    
    // In a real implementation, this would call the generateMarketingContent function
    // generateContentMutation.mutate({
    //   type: data.type,
    //   serviceId: data.serviceId ? parseInt(data.serviceId) : undefined,
    //   prompt: data.prompt
    // });
  }
  
  function copyToClipboard() {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied to clipboard",
        description: "The content has been copied to your clipboard.",
      });
    }
  }
  
  // Mock services for UI demonstration
  const mockServices = [
    { id: 1, name: "Ocean View Villa", type: "stays" },
    { id: 2, name: "Jeep Rental", type: "vehicles" },
    { id: 3, name: "Island Tour Package", type: "tours" },
  ];
  
  // Mock previously generated content
  const mockPreviousContent = [
    {
      id: 1,
      title: "Instagram Post - Beach Villa",
      type: "instagram",
      content: "🌴 Wake up to paradise! Our beachfront villa is the perfect escape from everyday life. Book now for special summer rates! #IslandEscape #BeachVilla",
      createdAt: "2023-01-02T12:30:00Z"
    },
    {
      id: 2,
      title: "SEO Description - Tour Package",
      type: "seo",
      content: "Discover the hidden gems of our tropical island with our all-inclusive tour packages. Expert local guides, authentic experiences, and breathtaking views guaranteed on every excursion.",
      createdAt: "2023-01-05T14:45:00Z"
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">AI Marketing Tools</h1>
      
      <Tabs defaultValue="generate">
        <TabsList className="mb-6">
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="history">Content History</TabsTrigger>
        </TabsList>
        
        {/* Generate Content Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="instagram">
                                  <div className="flex items-center">
                                    <Instagram className="h-4 w-4 mr-2" />
                                    <span>Instagram Caption</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="facebook">
                                  <div className="flex items-center">
                                    <Facebook className="h-4 w-4 mr-2" />
                                    <span>Facebook Post</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="seo">
                                  <div className="flex items-center">
                                    <Search className="h-4 w-4 mr-2" />
                                    <span>SEO Description</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service (Optional)</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No specific service</SelectItem>
                                {mockServices.map(service => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Target the content for a specific service, or leave empty for general content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write a captivating description of my beachfront villa highlighting the ocean views and amenities..."
                                className="h-32 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Describe what you want to create. Be specific about tone, features, and target audience.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <SpeechIcon className="mr-2 h-4 w-4" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Generated Content</h3>
                  
                  {isGenerating ? (
                    <div className="border rounded-md p-4 h-72 flex items-center justify-center bg-neutral-50">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-neutral-500">Generating creative content...</p>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <div className="border rounded-md p-4 h-72 relative">
                      <div className="absolute top-4 right-4 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={copyToClipboard}
                        >
                          <Clipboard className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="overflow-auto h-full pr-2">
                        <p className="whitespace-pre-wrap">{generatedContent}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md p-4 h-72 flex items-center justify-center bg-neutral-50">
                      <div className="text-center">
                        <ArrowRight className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-500">Fill out the form and click generate to create content</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <p className="text-sm text-neutral-500">
                      AI-generated content is a starting point. Edit as needed for your brand voice.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Previously Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPreviousContent.map((content) => (
                  <div key={content.id} className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{content.title}</h3>
                        <p className="text-sm text-neutral-500">
                          {new Date(content.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(content.content);
                            toast({
                              title: "Copied to clipboard",
                              description: "The content has been copied to your clipboard.",
                            });
                          }}
                        >
                          <Clipboard className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-neutral-50 rounded-md">
                      <p className="text-sm">{content.content}</p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm">
                        Edit & Regenerate
                      </Button>
                    </div>
                  </div>
                ))}
                
                {mockPreviousContent.length === 0 && (
                  <div className="text-center p-8 border rounded-md bg-neutral-50">
                    <SpeechIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No generated content yet</h3>
                    <p className="text-neutral-500 mb-4">
                      Generate your first AI marketing content by using the generator
                    </p>
                    <Button>
                      Generate Your First Content
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
