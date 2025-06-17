import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertCircle, CheckCircle, Info, RefreshCw, Search, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SystemLog {
  id: string;
  airtableId: string;
  eventTime: string;
  eventType: string;
  table: string;
  recordId: string;
  userAgent: string;
  description: string;
  status: string;
}

export default function SystemLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch system logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/system/logs'],
    queryFn: () => apiRequest('GET', '/api/system/logs'),
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const logs = logsData?.data || [];

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log: SystemLog) => {
    const matchesSearch = searchQuery === "" || 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.table.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || log.eventType === filterType;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'CREATE': return 'bg-blue-100 text-blue-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'Agent Execution': return 'bg-purple-100 text-purple-800';
      case 'Data Sync': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueEventTypes = Array.from(new Set(logs.map((log: SystemLog) => log.eventType)));
  const uniqueStatuses = Array.from(new Set(logs.map((log: SystemLog) => log.status)));

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
          <h1 className="text-3xl font-bold tracking-tight">System Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor all system operations and events in real-time
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueEventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              System events logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.length > 0 
                ? `${((logs.filter((log: SystemLog) => log.status === 'Success').length / logs.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Operations successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log: SystemLog) => {
                const logTime = new Date(log.eventTime);
                const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return logTime > hourAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Events in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.length > 0 
                ? `${((logs.filter((log: SystemLog) => log.status === 'Error').length / logs.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Operations failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Activity Log</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredLogs.length} of {logs.length} events</span>
          </div>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log: SystemLog) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getEventTypeColor(log.eventType)}>
                          {log.eventType}
                        </Badge>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.table}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {log.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Time: {formatTime(log.eventTime)}</span>
                        <span>Agent: {log.userAgent}</span>
                        {log.recordId && <span>Record: {log.recordId}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(log.eventTime)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <Card className="p-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Logs Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== "all" || filterStatus !== "all"
                ? "No logs match your current filters"
                : "System activity will appear here as events occur"
              }
            </p>
            {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}