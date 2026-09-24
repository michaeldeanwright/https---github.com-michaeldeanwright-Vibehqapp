import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsControl({ control, value, onChange }) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => setDraft(value ?? ""), [value]);

  if (control.type === "toggle") {
    return (
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <p className="font-medium text-[15px]">{control.label}</p>
          {control.help && <p className="text-xs text-muted-foreground mt-0.5">{control.help}</p>}
        </div>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }

  if (control.type === "choice") {
    return (
      <div className="px-5 py-4 space-y-1">
        <p className="font-medium text-[15px] mb-2">{control.label}</p>
        {control.options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="w-full flex items-center justify-between gap-3 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className={value === o.value ? "text-foreground font-medium" : ""}>{o.label}</span>
            {value === o.value && <Check className="w-4 h-4 vibe-text shrink-0" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      <p className="font-medium text-[15px]">{control.label}</p>
      <Input type={control.type === "date" ? "date" : "text"} value={draft} placeholder={control.placeholder} onChange={(e) => setDraft(e.target.value)} />
      <Button className="rounded-full" disabled={draft === (value ?? "")} onClick={() => onChange(draft)}>
        Save
      </Button>
    </div>
  );
}