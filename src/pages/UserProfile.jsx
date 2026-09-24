import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useMe, usePosts, usePeople } from "@/components/vibe/useMe";
import { openConversation } from "@/lib/chat";
import Avatar from "@/components/vibe/Avatar";
import PostList from "@/components/vibe/PostList";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: profiles = [] } = usePeople();
  const { data: posts = [], isLoading, error: postsError } = usePosts();
  const [busy, setBusy] = useState(false);
  if (!me) return null;

  const profile = profiles.find((p) => p.user_id === id);
  const name = profile?.full_name || "Member";
  const mine = posts.filter((p) => p.created_by_id === id);
  const likes = mine.reduce((n, p) => n + (p.liked_by?.length || 0), 0);

  const message = async () => {
    setBusy(true);
    const convo = await openConversation(me, { user_id: id, full_name: name, email: profile?.email });
    navigate(`/messages/${convo.id}`);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground p-1">
        <ArrowLeft className="w-4 h-4" />Back
      </button>
      <div className="bg-card rounded-3xl p-6 border border-border/60 text-center">
        <div className="flex justify-center"><Avatar name={name} size="lg" /></div>
        <h2 className="font-display text-3xl mt-4">{name}</h2>
        {profile?.email && <p className="text-sm text-muted-foreground">{profile.email}</p>}
        <div className="flex justify-center gap-10 mt-5">
          <div><p className="text-2xl font-semibold">{mine.length}</p><p className="text-xs uppercase tracking-widest text-muted-foreground">Posts</p></div>
          <div><p className="text-2xl font-semibold">{likes}</p><p className="text-xs uppercase tracking-widest text-muted-foreground">Likes</p></div>
        </div>
        {id !== me.id && (
          <button onClick={message} disabled={busy}
            className="mt-6 inline-flex items-center gap-2 vibe-gradient text-white text-sm font-semibold rounded-full px-5 py-2.5 disabled:opacity-40">
            <MessageCircle className="w-4 h-4" />Message
          </button>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground px-2 pt-2">Posts</p>
      <PostList posts={mine} me={me} loading={isLoading} error={postsError} emptyText="No posts yet." />
    </div>
  );
}