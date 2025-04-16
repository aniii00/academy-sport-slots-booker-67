import React from "react";
import { 
  Home,
  Search,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  Filter,
  Football,
  Tennis,
  Dumbbell,
  Bicycle,
  Target,
  BadmintonIcon as BadmintonIconLucide,
  Swimming,
  CircleDashed,
  Star,
  StarHalf,
  CreditCard,
  Banknote,
  Share2
} from "lucide-react";

// Map sport names to icons
export const getSportIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    swim: <Timer className="h-6 w-6" />,
    tennis: <Activity className="h-6 w-6" />,
    football: <Award className="h-6 w-6" />,
    basketball: <Trophy className="h-6 w-6" />,
    cricket: <BarChart className="h-6 w-6" />, // Using BarChart as a substitute for cricket
    badminton: <Activity className="h-6 w-6" /> // Using Activity as a substitute for badminton
  };

  return iconMap[iconName.toLowerCase()] || <Sport className="h-6 w-6" />;
};

// Additional icons for UI
export const Sport = (props: any) => <BarChart {...props} />;
export const LocationIcon = (props: any) => <MapPin {...props} />;
export const CalendarIcon = (props: any) => <Calendar {...props} />;
export const TimeIcon = (props: any) => <Clock {...props} />;
export const PriceIcon = (props: any) => <CircleDollarSign {...props} />;
export const UserIcon = (props: any) => <User {...props} />;
export const PhoneIcon = (props: any) => <Phone {...props} />;
export const FilterIcon = (props: any) => <Filter {...props} />;
export const SearchIcon = (props: any) => <Search {...props} />;
export const ArrowRightIcon = (props: any) => <ChevronRight {...props} />;
export const LoginIcon = (props: any) => <LogIn {...props} />;
export const LogoutIcon = (props: any) => <LogOut {...props} />;
export const SettingsIcon = (props: any) => <Settings {...props} />;
export const HomeIcon = (props: any) => <Home {...props} />;
export const ListIcon = (props: any) => <List {...props} />;
export const GridIcon = (props: any) => <Grid {...props} />;
export const AddIcon = (props: any) => <PlusCircle {...props} />;
export const DeleteIcon = (props: any) => <Trash {...props} />;
export const EditIcon = (props: any) => <Edit {...props} />;
export const CheckIcon = (props: any) => <Check {...props} />;
export const CloseIcon = (props: any) => <X {...props} />;
export const BackIcon = (props: any) => <ArrowLeft {...props} />;
export const ChartIcon = (props: any) => <BarChart {...props} />;

export const EmailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <Mail {...props} />
);

export const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || "24"}
    height={props.height || "24"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
    <path d="M8.5 13.5c.5 1.5 2 2.5 3.5 2.5s3-1 3.5-2.5" />
  </svg>
);
