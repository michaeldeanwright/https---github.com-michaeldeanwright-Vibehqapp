import { useState } from "react";
import { Link } from "react-router-dom";
import { SquarePen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useMe } from "@/components/vibe/useMe";
import Avatar from "@/components/vibe/Avatar";
import NewMessageDialog from "@/components/vibe/NewMessageDialog";

export default function Messages() {
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);
  const { data: convos = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => base44.entities.Conversation.list("-updated_date", 100),
  });
  if (!me) return null;

  const mine = convos.filter((c) => c.participants?.includes(me.id));

  return (
    <div className="space-y-4">
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 vibe-gradient text-white font-semibold rounded-full py-3 text-sm">
        <SquarePen className="w-4 h-4" />New message
      </button>

      {isLoading && <div className="h-16 rounded-2xl bg-muted animate-pulse" />}
      {!isLoading && mine.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-16">No conversations yet. Start one above.</p>
      )}

      <div className="space-y-1">
        {mine.map((c) => {
          const i = c.participants.indexOf(me.id);
          const name = c.participant_names?.[i === 0 ? 1 : 0] || "Member";
          return (
            <Link key={c.id} to={`/messages/${c.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors">
              <Avatar name={name} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[15px] truncate">{name}</p>
                <p className="text-sm text-muted-foreground truncate">{c.last_message || "Say hi 👋"}</p>
              </div>
              {c.last_message_at && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <NewMessageDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}