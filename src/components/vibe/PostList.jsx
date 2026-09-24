import PostCard from "./PostCard";

export default function PostList({ posts, me, loading, error, emptyText }) {
  if (loading) {
    return [0, 1, 2].map((i) => <div key={i} className="h-40 rounded-3xl bg-muted animate-pulse" />);
  }
  if (error) {
    return <p className="text-center text-destructive text-sm py-8 px-4">Couldn't load posts: {error.message}</p>;
  }
  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground text-sm py-16">{emptyText}</p>;
  }
  return posts.map((p) => <PostCard key={p.id} post={p} me={me} />);
}