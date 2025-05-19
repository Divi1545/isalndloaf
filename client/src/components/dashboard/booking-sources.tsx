import { Card, CardContent } from "@/components/ui/card";

interface BookingSourcesProps {
  sources: {
    name: string;
    percentage: number;
    color: string;
  }[];
}

export default function BookingSources({ sources }: BookingSourcesProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">Booking Sources</h3>
        
        <div className="space-y-3">
          {sources.map((source, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-700">{source.name}</span>
                <span className="text-sm font-medium">{source.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${source.color} rounded-full`} 
                  style={{ width: `${source.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
