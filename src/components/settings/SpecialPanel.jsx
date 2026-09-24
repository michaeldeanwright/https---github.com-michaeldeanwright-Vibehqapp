import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Monitor, Smartphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfiles } from "@/components/vibe/useMe";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SettingsControl from "./SettingsControl";
import { applyTheme, savedTheme } from "@/lib/theme";

function ProfileInfo({ me }) {
  const qc = useQueryClient();
  const { data: profiles = [] } = useProfiles();
  const mine = profiles.find((p) => p.user_id === me?.id);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!mine) return;
    setName(mine.full_name || "");
    setBio(mine.bio || "");
  }, [mine]);

  const save = async () => {
    if (!mine) return;
    await base44.entities.Profile.update(mine.id, { full_name: name, bio });
    qc.invalidateQueries({ queryKey: ["profiles"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Display name</Label>
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-bio">Bio</Label>
        <Input id="profile-bio" value={bio} placeholder="Tell people about yourself" onChange={(e) => setBio(e.target.value)} />
      </div>
      <Button className="rounded-full" disabled={!mine || (name === mine.full_name && bio === (mine.bio || ""))} onClick={save}>
        {saved ? "Saved" : "Save changes"}
      </Button>
    </div>
  );
}

function ContactInfo({ me, save }) {
  return (
    <div className="px-5 py-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="account-email">Email address</Label>
        <Input id="account-email" value={me?.email || ""} disabled />
      </div>
      <div className="border-t border-border/60 -mx-5 pt-4">
        <SettingsControl
          control={{ field: "settings_phone", type: "text", label: "Phone number", placeholder: "+1 555 000 0000" }}
          value={me?.settings_phone}
          onChange={(v) => save("settings_phone", v)}
        />
      </div>
    </div>
  );
}

function Password({ me }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      await base44.auth.resetPasswordRequest(me.email);
      setSent(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="px-5 py-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        We'll email a secure link to {me?.email} so you can choose a new password.
      </p>
      <Button className="rounded-full" onClick={send} disabled={busy || sent}>
        {sent ? "Email sent" : busy ? "Sending…" : "Send password reset email"}
      </Button>
    </div>
  );
}

function LoginActivity({ me }) {
  const ua = navigator.userAgent;
  const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile device" : "Desktop browser";
  const browser = /Edg/.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : /Firefox/.test(ua) ? "Firefox" : "Web browser";
  const created = me?.created_date ? new Date(me.created_date).toLocaleDateString() : "—";
  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex items-start gap-3">
        <Monitor className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
        <div>
          <p className="font-medium text-[15px]">This device</p>
          <p className="text-xs text-muted-foreground">{browser} · {device} · Active now</p>
        </div>
      </div>
      <div className="flex items-start gap-3 border-t border-border/60 pt-4">
        <Smartphone className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
        <div>
          <p className="font-medium text-[15px]">VibeHQ account created</p>
          <p className="text-xs text-muted-foreground">{created}</p>
        </div>
      </div>
    </div>
  );
}

function AccountStatus() {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="px-5 py-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        Deactivating hides your profile and posts from VibeHQ until you sign back in.
      </p>
      {confirming ? (
        <div className="flex gap-2">
          <Button variant="destructive" className="rounded-full" onClick={() => base44.auth.logout()}>
            Yes, deactivate
          </Button>
          <Button variant="ghost" className="rounded-full" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="rounded-full" onClick={() => setConfirming(true)}>
          Deactivate account
        </Button>
      )}
    </div>
  );
}

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function Appearance({ me, save }) {
  const current = me?.settings_appearance || savedTheme();
  const choose = (value) => {
    localStorage.setItem("vibe_theme", value);
    applyTheme(value);
    save("settings_appearance", value);
  };
  return (
    <div className="px-5 py-4 space-y-1">
      {themeOptions.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => choose(o.value)}
          className="w-full flex items-center justify-between py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className={current === o.value ? "text-foreground font-medium" : ""}>{o.label}</span>
          {current === o.value && <Check className="w-4 h-4 vibe-text" />}
        </button>
      ))}
    </div>
  );
}

const panels = { profileInfo: ProfileInfo, contactInfo: ContactInfo, password: Password, loginActivity: LoginActivity, accountStatus: AccountStatus, appearance: Appearance };

export default function SpecialPanel({ panel, me, save }) {
  const Panel = panels[panel];
  if (!Panel) return null;
  return <Panel me={me} save={save} />;
}