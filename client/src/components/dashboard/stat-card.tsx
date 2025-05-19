import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  trend,
  subtitle,
  className
}: StatCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-600 text-sm">{title}</p>
            <h3 className="text-2xl font-bold font-data mt-1">{value}</h3>
            {trend && (
              <p className={cn(
                "text-sm font-medium flex items-center mt-1",
                trend.isPositive !== false ? "text-green-600" : "text-red-600"
              )}>
                <i className={cn(
                  "mr-1",
                  trend.isPositive !== false ? "ri-arrow-up-line" : "ri-arrow-down-line"
                )}></i>
                {trend.value}
              </p>
            )}
            {subtitle && (
              <p className="text-neutral-600 text-sm font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl",
            iconBgColor,
            iconColor
          )}>
            <i className={icon}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
