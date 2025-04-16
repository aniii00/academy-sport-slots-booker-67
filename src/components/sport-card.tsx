
import { Link } from "react-router-dom";
import { getSportIcon } from "@/utils/iconMapping";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sport } from "@/data/mockData";

interface SportCardProps {
  sport: Sport;
  className?: string;
}

export function SportCard({ sport, className }: SportCardProps) {
  return (
    <Link to={`/centers?sportId=${sport.id}`}>
      <Card className={cn("h-full transition-all hover:shadow-md", className)}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 p-3 rounded-full bg-sports-lightBlue text-sports-blue">
            {getSportIcon(sport.icon)}
          </div>
          <h3 className="font-semibold text-lg mb-1">{sport.name}</h3>
          <p className="text-sm text-gray-500">{sport.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
