import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useMe, usePosts, useProfiles } from "@/components/vibe/useMe";
import Avatar from "@/components/vibe/Avatar";
import CommentsSheet from "@/components/vibe/CommentsSheet";

export default function Notifications() {
  const { data: me } = useMe();
  const { data: posts = [], isLoading } = usePosts();
  const { data: profiles = [] } = useProfiles();
  const [active, setActive] = useState(null);
  const { data: comments = [] } = useQuery({
    queryKey: ["all-comments"],
    queryFn: () => base44.entities.Comment.list("-created_date", 200),
  });
  if (!me) return null;

  const myPosts = posts.filter((p) => p.created_by_id === me.id);
  const ids = new Set(myPosts.map((p) => p.id));
  const nameOf = (uid) => profiles.find((p) => p.user_id === uid)?.full_name || "Someone";

  const items = [];
  comments.filter((c) => ids.has(c.post_id) && c.created_by_id !== me.id).forEach((c) => {
    items.push({ key: c.id, icon: MessageCircle, actor: c.author_name, text: `${c.author_name} commented on your post`, detail: c.content, date: c.created_date, post: myPosts.find((p) => p.id === c.post_id) });
  });
  myPosts.forEach((p) => (p.liked_by || []).filter((uid) => uid !== me.id).forEach((uid) => {
    items.push({ key: `${p.id}-${uid}`, icon: Heart, actor: nameOf(uid), text: `${nameOf(uid)} liked your post`, detail: p.content, date: p.updated_date, post: p });
  }));
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-2">
      {isLoading && <div className="h-20 rounded-3xl bg-muted animate-pulse" />}
      {!isLoading && items.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-16">No activity yet. When people like or comment on your posts, it shows up here.</p>
      )}
      {items.map((n) => (
        <button key={n.key} onClick={() => setActive(n.post)}
          className="w-full flex gap-3 p-3 rounded-3xl bg-card border border-border/60 text-left hover:bg-muted/50 transition-colors">
          <div className="relative">
            <Avatar name={n.actor} />
            <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border">
              <n.icon className="w-3 h-3 text-[#5b8fc1]" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{n.text}</p>
            {n.detail && <p className="text-sm text-muted-foreground truncate mt-0.5">“{n.detail}”</p>}
            <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.date), { addSuffix: true })}</p>
          </div>
        </button>
      ))}
      {active && <CommentsSheet post={active} me={me} open={!!active} onOpenChange={(o) => !o && setActive(null)} />}
    </div>
  );
}