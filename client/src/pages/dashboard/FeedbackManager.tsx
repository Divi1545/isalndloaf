import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Star, TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
  id: string;
  airtableId: string;
  bookingId: string;
  vendorId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  responseByVendor?: string;
  responseTime?: string;
  createdAt: string;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  responseRate: number;
}

export default function FeedbackManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: '',
    vendorId: '',
    customerName: '',
    rating: '5',
    reviewText: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feedback
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: () => apiRequest('GET', '/api/feedback')
  });

  // Fetch feedback statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/feedback/stats'],
    queryFn: () => apiRequest('GET', '/api/feedback/stats')
  });

  // Fetch bookings for dropdown
  const { data: bookingsData } = useQuery({
    queryKey: ['/api/airtable/bookings'],
    queryFn: () => apiRequest('GET', '/api/airtable/bookings')
  });

  // Fetch vendors for dropdown
  const { data: vendorsData } = useQuery({
    queryKey: ['/api/airtable/vendors'],
    queryFn: () => apiRequest('GET', '/api/airtable/vendors')
  });

  // Create feedback mutation
  const createFeedbackMutation = useMutation({
    mutationFn: (feedbackData: any) => apiRequest('POST', '/api/feedback', feedbackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/stats'] });
      setIsDialogOpen(false);
      setFormData({
        bookingId: '',
        vendorId: '',
        customerName: '',
        rating: '5',
        reviewText: ''
      });
      toast({
        title: "Feedback Added",
        description: "Customer feedback has been recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add feedback",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedbackMutation.mutate(formData);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'Negative': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const feedback = feedbackData?.data || [];
  const stats: FeedbackStats = statsData?.data || {
    totalFeedback: 0,
    averageRating: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    responseRate: 0
  };
  const bookings = bookingsData?.data || [];
  const vendors = vendorsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Feedback</h1>
          <p className="text-muted-foreground">
            Monitor and analyze customer reviews and satisfaction
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Customer Feedback</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking">Booking</Label>
                  <Select 
                    value={formData.bookingId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, bookingId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((booking: any) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.id} - {booking.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select 
                    value={formData.vendorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select 
                  value={formData.rating} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ - Excellent</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ - Very Good</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ - Good</SelectItem>
                    <SelectItem value="2">⭐⭐ - Fair</SelectItem>
                    <SelectItem value="1">⭐ - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewText">Review</Label>
                <Textarea
                  id="reviewText"
                  value={formData.reviewText}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                  placeholder="Enter customer review..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFeedbackMutation.isPending}
                >
                  {createFeedbackMutation.isPending ? "Adding..." : "Add Feedback"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Customer reviews received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.sentimentBreakdown.positive}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFeedback > 0 
                ? `${((stats.sentimentBreakdown.positive / stats.totalFeedback) * 100).toFixed(1)}%`
                : '0%'
              } of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Vendor response rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.sentimentBreakdown.positive}
              </div>
              <Badge className="bg-green-100 text-green-800">
                <ThumbsUp className="mr-1 h-3 w-3" />
                Positive
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">
                {stats.sentimentBreakdown.neutral}
              </div>
              <Badge className="bg-gray-100 text-gray-800">
                <Minus className="mr-1 h-3 w-3" />
                Neutral
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {stats.sentimentBreakdown.negative}
              </div>
              <Badge className="bg-red-100 text-red-800">
                <ThumbsDown className="mr-1 h-3 w-3" />
                Negative
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Feedback</h2>
        {feedback.map((item: Feedback) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.customerName}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {renderStars(item.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Booking: {item.bookingId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSentimentColor(item.sentiment)}>
                    {getSentimentIcon(item.sentiment)}
                    <span className="ml-1">{item.sentiment}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{item.reviewText}</p>
              {item.responseByVendor && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">
                    Vendor Response:
                  </h4>
                  <p className="text-blue-800 text-sm">{item.responseByVendor}</p>
                </div>
              )}
              <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                <span>Vendor: {item.vendorId}</span>
                {item.responseTime && (
                  <span>Responded: {new Date(item.responseTime).toLocaleDateString()}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedback.length === 0 && (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start collecting customer feedback to improve your services
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Feedback
          </Button>
        </Card>
      )}
    </div>
  );
}