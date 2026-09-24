import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { settingsGroups } from "@/components/settings/settingsConfig";

export default function Settings() {
  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2 -ml-1">
        <Link to="/profile" aria-label="Back" className="p-1.5 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl">Settings & privacy</h1>
      </header>
      {settingsGroups.map((group) => (
        <section key={group.id} className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground px-2">{group.title}</p>
          <div className="bg-card rounded-3xl border border-border/60 divide-y divide-border/60 overflow-hidden">
            {group.items.map((item) => (
              <Link key={item.key} to={`/settings/${item.key}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[15px]">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}