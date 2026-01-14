import { Compass, Search, Heart, List, User, History } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const MobileNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Compass, label: "Discover", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    ...(isAuthenticated
      ? [
          { icon: Heart, label: "Favorites", path: "/liked" },
          { icon: List, label: "Playlists", path: "/playlists" },
          { icon: User, label: "Profile", path: "/profile" },
        ]
      : []),
  ];

  return (
    <nav className="mobile-nav sm:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "animate-bounce-slow" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
