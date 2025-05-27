import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Support dashboard page according to the checklist
const SupportDashboard = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supportStatus, setSupportStatus] = useState('all');
  const { toast } = useToast();
  
  // Sample support tickets data for demonstration
  const supportTickets = [
    {
      id: 'TKT-1001',
      vendorId: 'V-1001',
      vendorName: 'Beach Paradise Villa',
      subject: 'Calendar sync not working',
      message: 'I tried to sync my Google Calendar but it\'s not pulling in my existing bookings. Can you help me fix this issue?',
      status: 'open',
      priority: 'high',
      category: 'technical',
      createdAt: '2025-04-15T10:30:00Z',
      updatedAt: '2025-04-15T10:30:00Z',
      assignedTo: null,
      internalNotes: ''
    },
    {
      id: 'TKT-1002',
      vendorId: 'V-1002',
      vendorName: 'Island Adventures',
      subject: 'Need to update payment details',
      message: 'I need to update my bank account information for payouts. How can I do this securely?',
      status: 'in_progress',
      priority: 'medium',
      category: 'billing',
      createdAt: '2025-04-16T08:15:00Z',
      updatedAt: '2025-04-16T14:20:00Z',
      assignedTo: 'Admin',
      internalNotes: 'Sent secure payment update form via email.'
    },
    {
      id: 'TKT-1003',
      vendorId: 'V-1003',
      vendorName: 'Coastal Scooters',
      subject: 'Customer reported wrong information',
      message: 'A customer reported that our listing shows scooters with GPS but we don\'t offer that feature. How can we update our listing?',
      status: 'resolved',
      priority: 'medium',
      category: 'content',
      createdAt: '2025-04-17T11:45:00Z',
      updatedAt: '2025-04-18T09:30:00Z',
      assignedTo: 'Admin',
      internalNotes: 'Listing updated to remove GPS feature mention. Notified vendor of the change.'
    },
    {
      id: 'TKT-1004',
      vendorId: 'V-1004',
      vendorName: 'Wellness Retreat',
      subject: 'Commission rate dispute',
      message: 'Our commission rate seems higher than what we agreed to. Could you please review our account?',
      status: 'open',
      priority: 'high',
      category: 'billing',
      createdAt: '2025-04-19T13:20:00Z',
      updatedAt: '2025-04-19T13:20:00Z',
      assignedTo: null,
      internalNotes: ''
    },
    {
      id: 'TKT-1005',
      vendorId: 'V-1005',
      vendorName: 'Seafood Delight',
      subject: 'Need help with marketing content',
      message: 'The AI marketing tool isn\'t generating good descriptions for our seafood restaurant. Can someone help us create better content?',
      status: 'in_progress',
      priority: 'low',
      category: 'marketing',
      createdAt: '2025-04-20T15:10:00Z',
      updatedAt: '2025-04-21T10:05:00Z',
      assignedTo: 'Admin',
      internalNotes: 'Working with vendor to get better inputs for the AI system. Scheduled a call for tomorrow.'
    }
  ];

  // Filter tickets based on search and filters
  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      ticket.status === statusFilter;
    
    const matchesSupportStatus = supportStatus === 'all' || 
      ticket.status.toLowerCase() === supportStatus.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesSupportStatus;
  });

  // Reply Dialog Component
  const ReplyDialog = ({ ticket }: { ticket: typeof supportTickets[0] }) => {
    const [replyMessage, setReplyMessage] = useState('');
    const [internalNotes, setInternalNotes] = useState(ticket.internalNotes);
    const [ticketStatus, setTicketStatus] = useState(ticket.status);
    const { toast } = useToast();

    const handleSendReply = () => {
      if (!replyMessage) {
        toast({
          title: "Missing information",
          description: "Please enter a reply message",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Reply sent",
        description: `Reply to ticket ${ticket.id} has been sent to ${ticket.vendorName}`
      });

      // Reset form
      setReplyMessage('');
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Reply</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Support Ticket #{ticket.id}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{ticket.vendorName}</span>
                <span className="text-xs text-slate-500">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <h4 className="text-sm font-medium mb-2">{ticket.subject}</h4>
              <p className="text-sm">{ticket.message}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Your Reply</label>
              <Textarea 
                placeholder="Type your reply here..."
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Internal Notes (not visible to vendor)</label>
              <Textarea 
                placeholder="Add internal notes here..."
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ticket Status</label>
              <Select value={ticketStatus} onValueChange={setTicketStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" className="mr-2">Cancel</Button>
            <Button onClick={handleSendReply}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Mark as resolved function
  const handleMarkResolved = (ticketId: string) => {
    // In a real app, this would call an API to update the ticket status
    const updatedTickets = supportTickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, status: 'resolved' };
      }
      return ticket;
    });
    
    // Instead we're just showing a toast notification for the demo
    toast({
      title: "Ticket resolved",
      description: `Ticket ${ticketId} has been marked as resolved`
    });
    
    // Force a refresh of the filtered tickets
    setSupportStatus(supportStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
        <Button onClick={() => setLocation('/admin/support/create')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Support Ticket
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-1">
                {supportTickets.filter(t => t.status === 'open').length}
              </div>
              <div className="text-sm text-slate-500">Open Tickets</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {supportTickets.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-sm text-slate-500">In Progress</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-1">
                {supportTickets.filter(t => t.status === 'resolved').length}
              </div>
              <div className="text-sm text-slate-500">Resolved Today</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-1">
                {supportTickets.filter(t => t.priority === 'high').length}
              </div>
              <div className="text-sm text-slate-500">High Priority</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue="all" 
        value={supportStatus}
        onValueChange={setSupportStatus}
      >
        <TabsList>
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>Vendor Support Tickets</CardTitle>
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-[300px]"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Vendor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-3 text-sm">{ticket.id}</td>
                        <td className="px-4 py-3 text-sm">{ticket.vendorName}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">{ticket.subject}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[250px]">
                            {ticket.message}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={`${
                            ticket.status === 'open' ? 'bg-purple-100 text-purple-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {ticket.status === 'in_progress' ? 'In Progress' : 
                              ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={`${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <ReplyDialog ticket={ticket} />
                            
                            {ticket.status !== 'resolved' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkResolved(ticket.id)}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTickets.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <line x1="3" x2="21" y1="9" y2="9"></line>
                      <path d="m9 16 3-3 3 3"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1">No tickets found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default SupportDashboard;