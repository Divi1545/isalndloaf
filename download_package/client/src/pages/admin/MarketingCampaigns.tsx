import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Marketing dashboard according to the checklist
const MarketingCampaigns = () => {
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState('');
  const { toast } = useToast();

  // Active campaigns data
  const activeCampaigns = [
    { 
      id: 1, 
      title: 'Summer Special', 
      type: 'Email', 
      status: 'Active',
      sent: 145,
      opened: 87,
      clicks: 32,
      promoCode: 'SUMMER25',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-30')
    },
    { 
      id: 2, 
      title: 'Last Minute Deals', 
      type: 'Email', 
      status: 'Scheduled',
      sent: 0,
      opened: 0,
      clicks: 0,
      promoCode: 'LASTMIN15',
      startDate: new Date('2025-06-10'),
      endDate: new Date('2025-06-25')
    },
    { 
      id: 3, 
      title: 'Early Bird 2026', 
      type: 'SMS', 
      status: 'Draft',
      sent: 0,
      opened: 0,
      clicks: 0,
      promoCode: 'EARLY2026',
      startDate: null,
      endDate: null
    }
  ];

  // Handle email blast
  const handleSendEmailBlast = () => {
    if (!campaignTitle || !campaignMessage) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Email campaign triggered",
      description: "Your marketing campaign has been scheduled",
    });

    // Reset form
    setCampaignTitle('');
    setCampaignMessage('');
  };

  // Handle promo code generation
  const handleGeneratePromoCode = () => {
    if (!promoCode || !discount) {
      toast({
        title: "Missing information",
        description: "Please enter a promo code and discount amount",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Promo code created",
      description: `Promo code ${promoCode} with ${discount}% discount has been created`,
    });

    // Reset form
    setPromoCode('');
    setDiscount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
        <Button onClick={() => 
          // In a real app, this would use React Router navigation
          localStorage.setItem("adminAction", "newMarketingCampaign")
        }>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Blast Tool */}
        <Card>
          <CardHeader>
            <CardTitle>Email Blast Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Campaign Title</label>
                <Input 
                  placeholder="Enter campaign title"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Email Message</label>
                <Textarea 
                  placeholder="Enter email content..."
                  rows={4}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                />
              </div>

              <Button 
                type="button" 
                className="w-full"
                onClick={handleSendEmailBlast}
              >
                Send Email Blast
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Promo Code Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Promo Code</label>
                <Input 
                  placeholder="e.g., SUMMER25"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Discount (%)</label>
                <Input 
                  type="number"
                  placeholder="e.g., 25"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              <Button 
                type="button" 
                className="w-full"
                onClick={handleGeneratePromoCode}
              >
                Generate Promo Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Marketing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Campaign</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Promo Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Performance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeCampaigns.map(campaign => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3 text-sm">{campaign.title}</td>
                    <td className="px-4 py-3 text-sm">{campaign.type}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{campaign.promoCode}</td>
                    <td className="px-4 py-3 text-sm">
                      {campaign.sent > 0 ? (
                        <div className="text-xs">
                          <div>Sent: {campaign.sent}</div>
                          <div>Opened: {campaign.opened} ({Math.round(campaign.opened/campaign.sent*100)}%)</div>
                          <div>Clicks: {campaign.clicks} ({Math.round(campaign.clicks/campaign.sent*100)}%)</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No data yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Edit</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            <path d="m15 5 4 4"></path>
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Delete</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingCampaigns;