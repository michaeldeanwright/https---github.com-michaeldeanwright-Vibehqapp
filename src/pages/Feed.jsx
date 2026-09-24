import { useMe, usePosts, useEnsureProfile } from "@/components/vibe/useMe";
import Composer from "@/components/vibe/Composer";
import PostList from "@/components/vibe/PostList";

export default function Feed() {
  const { data: me } = useMe();
  const { data: posts = [], isLoading, error: postsError } = usePosts();
  useEnsureProfile(me);
  if (!me) return null;
  return (
    <div className="space-y-4">
      <Composer me={me} />
      <PostList posts={posts} me={me} loading={isLoading} error={postsError} emptyText="The feed is quiet. Share the first vibe." />
    </div>
  );
}