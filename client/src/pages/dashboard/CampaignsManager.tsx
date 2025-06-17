import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Calendar, DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  airtableId: string;
  vendorId: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  budget: number;
  channel: string;
  kpi: string;
  leadsGenerated: number;
  status: 'Planned' | 'Active' | 'Paused' | 'Completed';
}

export default function CampaignsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    campaignName: '',
    startDate: '',
    endDate: '',
    budget: '',
    channel: '',
    kpi: '',
    status: 'Planned'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: () => apiRequest('GET', '/api/campaigns')
  });

  // Fetch active campaigns
  const { data: activeCampaignsData } = useQuery({
    queryKey: ['/api/campaigns/active'],
    queryFn: () => apiRequest('GET', '/api/campaigns/active')
  });

  // Fetch vendors for dropdown
  const { data: vendorsData } = useQuery({
    queryKey: ['/api/airtable/vendors'],
    queryFn: () => apiRequest('GET', '/api/airtable/vendors')
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => apiRequest('POST', '/api/campaigns', campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/active'] });
      setIsDialogOpen(false);
      setFormData({
        vendorId: '',
        campaignName: '',
        startDate: '',
        endDate: '',
        budget: '',
        channel: '',
        kpi: '',
        status: 'Planned'
      });
      toast({
        title: "Campaign Created",
        description: "Marketing campaign has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaignMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Planned': return 'bg-blue-100 text-blue-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Instagram': return '📸';
      case 'Facebook': return '📘';
      case 'Google Ads': return '🔍';
      case 'Email': return '📧';
      case 'TikTok': return '🎵';
      case 'YouTube': return '📺';
      default: return '📢';
    }
  };

  const campaigns = campaignsData?.data || [];
  const activeCampaigns = activeCampaignsData?.data || [];
  const vendors = vendorsData?.data || [];

  const totalBudget = campaigns.reduce((sum: number, campaign: Campaign) => sum + (campaign.budget || 0), 0);
  const totalLeads = campaigns.reduce((sum: number, campaign: Campaign) => sum + (campaign.leadsGenerated || 0), 0);

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
          <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage AI-powered marketing campaigns across all channels
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Select Vendor</Label>
                  <Select 
                    value={formData.vendorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vendor..." />
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
                <div className="space-y-2">
                  <Label htmlFor="channel">Marketing Channel</Label>
                  <Select 
                    value={formData.channel} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">📸 Instagram</SelectItem>
                      <SelectItem value="Facebook">📘 Facebook</SelectItem>
                      <SelectItem value="Google Ads">🔍 Google Ads</SelectItem>
                      <SelectItem value="Email">📧 Email Marketing</SelectItem>
                      <SelectItem value="TikTok">🎵 TikTok</SelectItem>
                      <SelectItem value="YouTube">📺 YouTube</SelectItem>
                      <SelectItem value="Website">🌐 Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  placeholder="Enter campaign name..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (LKR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpi">Key Performance Indicator (KPI)</Label>
                <Select 
                  value={formData.kpi} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, kpi: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select KPI..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                    <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                    <SelectItem value="Website Traffic">Website Traffic</SelectItem>
                    <SelectItem value="Booking Conversions">Booking Conversions</SelectItem>
                    <SelectItem value="Social Engagement">Social Engagement</SelectItem>
                    <SelectItem value="Email Subscriptions">Email Subscriptions</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
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
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Marketing campaigns created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Allocated marketing spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns Section */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns.map((campaign: Campaign) => (
              <Card key={campaign.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{campaign.campaignName}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-2">{getChannelIcon(campaign.channel)}</span>
                    {campaign.channel}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget:</span>
                      <span className="font-medium">LKR {campaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leads:</span>
                      <span className="font-medium">{campaign.leadsGenerated}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>KPI:</span>
                      <span className="font-medium">{campaign.kpi}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Campaigns</h2>
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign: Campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{campaign.campaignName}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <span className="mr-1">{getChannelIcon(campaign.channel)}</span>
                        {campaign.channel}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        {campaign.kpi}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                    <div className="text-lg font-semibold">LKR {campaign.budget.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Leads Generated</div>
                    <div className="text-lg font-semibold">{campaign.leadsGenerated}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Cost per Lead</div>
                    <div className="text-lg font-semibold">
                      {campaign.leadsGenerated > 0 
                        ? `LKR ${(campaign.budget / campaign.leadsGenerated).toFixed(0)}`
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Vendor: {campaign.vendorId}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {campaigns.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
          <p className="text-muted-foreground mb-4">
            Start creating marketing campaigns to promote your tourism services
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Campaign
          </Button>
        </Card>
      )}
    </div>
  );
}