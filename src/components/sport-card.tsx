
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
      <Card className={cn("h-full transition-all hover:shadow-lg rounded-2xl", className)}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 p-4 rounded-full bg-gradient-to-r from-sports-lightBlue to-sports-lightBlue/70 text-sports-blue shadow-md">
            {getSportIcon(sport.icon)}
          </div>
          <h3 className="font-semibold text-lg mb-1">{sport.name}</h3>
          <p className="text-sm text-gray-500">{sport.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
