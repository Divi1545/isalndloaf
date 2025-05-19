import { Card, CardContent } from "@/components/ui/card";

interface ServiceBreakdownProps {
  services: {
    type: string;
    percentage: number;
    icon: string;
    color: {
      bg: string;
      text: string;
    };
  }[];
}

export default function ServiceBreakdown({ services }: ServiceBreakdownProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">Service Breakdown</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`${service.color.bg} rounded-lg p-3 text-center`}
            >
              <div className={`w-8 h-8 mx-auto rounded-full ${service.color.bg.replace('50', '100')} flex items-center justify-center ${service.color.text}`}>
                <i className={service.icon}></i>
              </div>
              <p className="text-sm font-medium mt-1">{service.type}</p>
              <p className="text-lg font-bold font-data">{service.percentage}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
