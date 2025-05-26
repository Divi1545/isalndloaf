import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MarketingCampaigns = () => {
  const [, setLocation] = useLocation();
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState('');
  const { toast } = useToast();

  const handleNewCampaign = () => {
    setLocation('/admin/marketing/new-campaign');
  };

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
      title: "Email campaign sent!",
      description: "Your marketing campaign has been sent to all subscribers",
    });

    setCampaignTitle('');
    setCampaignMessage('');
  };

  const handleGeneratePromoCode = () => {
    const randomCode = 'PROMO' + Math.random().toString(36).substr(2, 5).toUpperCase();
    setPromoCode(randomCode);
    toast({
      title: "Promo Code Generated!",
      description: `New promo code: ${randomCode}`,
    });
  };

  const activeCampaigns = [
    { 
      id: 1, 
      title: 'Summer Special', 
      type: 'Email', 
      status: 'Active',
      sent: 145,
      opened: 87,
      clicks: 32,
      promoCode: 'SUMMER25'
    },
    { 
      id: 2, 
      title: 'Last Minute Deals', 
      type: 'Email', 
      status: 'Scheduled',
      sent: 0,
      opened: 0,
      clicks: 0,
      promoCode: 'LASTMIN15'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
        <Button onClick={handleNewCampaign}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Blast Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Campaign Title</label>
                <Input 
                  placeholder="Enter campaign title"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Message</label>
                <Textarea 
                  placeholder="Enter your marketing message"
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                />
              </div>
              <Button onClick={handleSendEmailBlast} className="w-full">
                Send Email Blast
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promo Code Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Generated Code</label>
                <Input 
                  placeholder="Click generate to create code"
                  value={promoCode}
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Discount (%)</label>
                <Input 
                  type="number"
                  placeholder="Enter discount percentage"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <Button onClick={handleGeneratePromoCode} className="w-full">
                Generate Promo Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Campaign</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Sent</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b">
                    <td className="py-2 px-4">{campaign.title}</td>
                    <td className="py-2 px-4">{campaign.type}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">{campaign.sent}</td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => console.log(`Editing campaign: ${campaign.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete ${campaign.title}?`)) {
                              console.log(`Deleting campaign: ${campaign.id}`);
                            }
                          }}
                        >
                          Delete
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