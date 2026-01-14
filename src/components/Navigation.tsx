import { Music, Compass, Heart, List, LogOut, User, Search, History, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-card border-b">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Music className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold gradient-text">Discoverly</h1>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <Compass className="w-5 h-5" />
              <span className="hidden sm:inline">{t("nav.discover")}</span>
            </Button>
          </Link>
          
          <Link to="/search">
            <Button variant="ghost" className="gap-2">
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">{t("nav.search")}</span>
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/liked">
                <Button variant="ghost" className="gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="hidden sm:inline">{t("nav.favorites")}</span>
                </Button>
              </Link>
              <Link to="/playlists">
                <Button variant="ghost" className="gap-2">
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline">{t("nav.playlists")}</span>
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost" className="gap-2">
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav.history")}</span>
                </Button>
              </Link>
              <Link to="/stats">
                <Button variant="ghost" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Stats</span>
                </Button>
              </Link>
              <Link to="/profile">
                <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 bg-muted/30 rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.username}</span>
                </div>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost">{t("nav.login")}</Button>
              </Link>
              <Link to="/signup">
                <Button>{t("nav.signup")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
