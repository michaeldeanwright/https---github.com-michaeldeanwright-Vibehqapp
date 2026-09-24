import { Outlet, NavLink } from "react-router-dom";
import { Home, User, Search, MessageCircle, Bell } from "lucide-react";
import { Image } from "@/components/ui/images";

const LOGO = "https://media.base44.com/images/public/6ab40ab4514614627e73c17a/796609456_vibehq-web-logo.png";

const tabs = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl px-5 pt-4 pb-3">
          <Image src={LOGO} alt="VibeHQ" className="h-12 w-12 rounded-2xl overflow-hidden shadow-sm" />
        </header>
        <main className="flex-1 px-4 pb-28">
          <Outlet />
        </main>
        <nav className="fixed bottom-0 inset-x-0 z-20 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto px-6 pb-4">
            <div className="flex items-center justify-between bg-foreground text-background rounded-full p-1.5 shadow-2xl shadow-black/20">
              {tabs.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive ? "bg-background text-foreground px-4 py-2.5" : "text-background/60 p-2.5"}`}>
                  {({ isActive }) => (
                    <>
                      <Icon className="w-5 h-5 shrink-0" />
                      {isActive && <span className="whitespace-nowrap">{label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}