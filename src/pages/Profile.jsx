import { LogOut, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMe, usePosts } from "@/components/vibe/useMe";
import Avatar from "@/components/vibe/Avatar";
import PostList from "@/components/vibe/PostList";

export default function Profile() {
  const { data: me } = useMe();
  const { data: posts = [], isLoading, error: postsError } = usePosts();
  if (!me) return null;
  const mine = posts.filter((p) => p.created_by_id === me.id);
  const likes = mine.reduce((n, p) => n + (p.liked_by?.length || 0), 0);
  const name = me.full_name || me.email;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-3xl p-6 border border-border/60 text-center relative">
        <Link to="/settings" aria-label="Account settings" className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors">
          <SettingsIcon className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex justify-center"><Avatar name={name} size="lg" /></div>
        <h2 className="font-display text-3xl mt-4">{name}</h2>
        <p className="text-sm text-muted-foreground">{me.email}</p>
        <div className="flex justify-center gap-10 mt-5">
          <div><p className="text-2xl font-semibold">{mine.length}</p><p className="text-xs uppercase tracking-widest text-muted-foreground">Posts</p></div>
          <div><p className="text-2xl font-semibold">{likes}</p><p className="text-xs uppercase tracking-widest text-muted-foreground">Likes</p></div>
        </div>
        <button onClick={() => base44.auth.logout()} className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border rounded-full px-4 py-2 transition-colors">
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground px-2 pt-2">Your posts</p>
      <PostList posts={mine} me={me} loading={isLoading} error={postsError} emptyText="You haven't posted yet." />
    </div>
  );
}