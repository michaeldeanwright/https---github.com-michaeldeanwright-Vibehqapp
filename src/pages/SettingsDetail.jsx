import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMe } from "@/components/vibe/useMe";
import { findSetting } from "@/components/settings/settingsConfig";
import SettingsControl from "@/components/settings/SettingsControl";
import SpecialPanel from "@/components/settings/SpecialPanel";

export default function SettingsDetail() {
  const { key } = useParams();
  const item = findSetting(key);
  const { data: me } = useMe();
  const qc = useQueryClient();

  if (!item) {
    return (
      <div className="space-y-4">
        <BackHeader title="Not found" />
        <p className="text-center text-sm text-muted-foreground py-16">This setting isn't available.</p>
      </div>
    );
  }

  const save = async (field, value) => {
    await base44.auth.updateMe({ [field]: value });
    qc.invalidateQueries({ queryKey: ["me"] });
  };

  return (
    <div className="space-y-4">
      <BackHeader title={item.title} />
      <div className="bg-card rounded-3xl border border-border/60 px-5 py-4">
        <p className="text-sm text-muted-foreground">{item.desc}</p>
      </div>
      <div className="bg-card rounded-3xl border border-border/60 divide-y divide-border/60 overflow-hidden">
        {item.panel && <SpecialPanel panel={item.panel} me={me} save={save} />}
        {(item.controls || []).map((control) => (
          <SettingsControl key={control.field} control={control} value={me?.[control.field]} onChange={(v) => save(control.field, v)} />
        ))}
      </div>
    </div>
  );
}

function BackHeader({ title }) {
  return (
    <header className="flex items-center gap-2 -ml-1">
      <Link to="/settings" aria-label="Back" className="p-1.5 rounded-full hover:bg-muted transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </Link>
      <h1 className="font-display text-2xl truncate">{title}</h1>
    </header>
  );
}