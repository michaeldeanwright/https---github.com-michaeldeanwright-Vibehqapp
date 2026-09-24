import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMe, useProfiles } from "./useMe";
import { openConversation } from "@/lib/chat";
import Avatar from "./Avatar";

export default function NewMessageDialog({ open, onOpenChange }) {
  const { data: me } = useMe();
  const { data: profiles = [] } = useProfiles();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const start = async (profile) => {
    setBusy(true);
    const convo = await openConversation(me, profile);
    setBusy(false);
    onOpenChange(false);
    navigate(`/messages/${convo.id}`);
  };

  const people = profiles.filter((p) => p.user_id !== me?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader><DialogTitle className="font-display text-2xl font-normal">New message</DialogTitle></DialogHeader>
        <div className="max-h-80 overflow-y-auto -mx-2">
          {people.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No one to message yet.</p>}
          {people.map((p) => (
            <button key={p.id} disabled={busy} onClick={() => start(p)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors text-left">
              <Avatar name={p.full_name} />
              <div className="min-w-0">
                <p className="font-semibold text-[15px] truncate">{p.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}