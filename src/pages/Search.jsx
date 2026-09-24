import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useMe, usePosts, usePeople } from "@/components/vibe/useMe";
import PersonRow from "@/components/vibe/PersonRow";
import PostList from "@/components/vibe/PostList";

export default function Search() {
  const { data: me } = useMe();
  const { data: profiles = [] } = usePeople();
  const { data: posts = [], isLoading, error: postsError } = usePosts();
  const [q, setQ] = useState("");
  if (!me) return null;

  const query = q.trim().toLowerCase();
  const others = profiles.filter((p) => p.user_id !== me.id);
  const people = query
    ? others.filter((p) => (p.full_name || "").toLowerCase().includes(query))
    : others.slice(0, 6);
  const results = query
    ? posts.filter((p) => (p.content || "").toLowerCase().includes(query) || (p.author_name || "").toLowerCase().includes(query))
    : [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people and posts"
          className="w-full bg-muted rounded-full pl-11 pr-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
      </div>

      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground px-2 pb-1">
          {query ? "People" : "People to follow"}
        </p>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-3">No people found.</p>
        ) : people.map((p) => <PersonRow key={p.id} profile={p} />)}
      </section>

      {query && (
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground px-2">Posts</p>
          <PostList posts={results} me={me} loading={isLoading} error={postsError} emptyText={`Nothing found for “${q.trim()}”.`} />
        </section>
      )}
    </div>
  );
}