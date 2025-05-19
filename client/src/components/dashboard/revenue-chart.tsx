import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const averageSale = data.reduce((sum, item) => sum + item.revenue, 0) / data.length;
  const conversionRate = 24.3; // Would come from API in real app
  const avgServiceTime = 3.2; // Would come from API in real app
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Revenue Trend</h3>
          <div className="flex space-x-2">
            <button 
              className={cn(
                "text-xs px-3 py-1 rounded-full",
                timeframe === "week" 
                  ? "bg-primary text-white" 
                  : "bg-primary-50 text-primary hover:bg-primary-100"
              )}
              onClick={() => setTimeframe("week")}
            >
              Week
            </button>
            <button 
              className={cn(
                "text-xs px-3 py-1 rounded-full",
                timeframe === "month" 
                  ? "bg-primary text-white" 
                  : "bg-primary-50 text-primary hover:bg-primary-100"
              )}
              onClick={() => setTimeframe("month")}
            >
              Month
            </button>
            <button 
              className={cn(
                "text-xs px-3 py-1 rounded-full",
                timeframe === "year" 
                  ? "bg-primary text-white" 
                  : "bg-primary-50 text-primary hover:bg-primary-100"
              )}
              onClick={() => setTimeframe("year")}
            >
              Year
            </button>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6c757d' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6c757d' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Revenue']}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e9ecef',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-neutral-600 text-sm">Average Sale</p>
            <p className="font-bold text-lg font-data">{formatCurrency(averageSale)}</p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm">Conversion Rate</p>
            <p className="font-bold text-lg font-data">{conversionRate}%</p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm">Avg. Service Time</p>
            <p className="font-bold text-lg font-data">{avgServiceTime} Days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
