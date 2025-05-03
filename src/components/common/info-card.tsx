import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  icon?: React.ReactNode;
}

export function InfoCard({
  title,
  value,
  description,
  trend,
  className,
  icon,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <CardTitle className="text-2xl font-bold">{value}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                vs ano anterior
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-primary bg-primary/10 p-4 rounded-full">{icon}</div>}
      </CardContent>
    </Card>
  );
}