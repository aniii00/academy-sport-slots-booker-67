
import { BackIcon } from "@/utils/iconMapping";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  action?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backTo = "/",
  action
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 mb-4 border-b">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Link to={backTo} className="p-2 rounded-full hover:bg-gray-100">
            <BackIcon className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
