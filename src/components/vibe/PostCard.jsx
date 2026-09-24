import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/images";
import Avatar from "./Avatar";
import CommentsSheet from "./CommentsSheet";

export default function PostCard({ post, me }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const likes = post.liked_by || [];
  const liked = likes.includes(me.id);
  const isMine = post.created_by_id === me.id;

  const toggleLike = async () => {
    const next = liked ? likes.filter((id) => id !== me.id) : [...likes, me.id];
    qc.setQueryData(["posts"], (old) => old?.map((p) => (p.id === post.id ? { ...p, liked_by: next } : p)));
    await base44.entities.Post.update(post.id, { liked_by: next });
  };

  const remove = async () => {
    await base44.entities.Post.delete(post.id);
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-card rounded-3xl p-4 shadow-sm shadow-black/[0.03] border border-border/60">
      <div className="flex items-center gap-3">
        <Avatar name={post.author_name} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] truncate">{post.author_name || "Someone"}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</p>
        </div>
        {isMine && <button onClick={remove} className="text-muted-foreground hover:text-destructive p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
      {post.image_url && <Image src={post.image_url} alt="Post" className="mt-3 w-full aspect-[4/3] rounded-2xl overflow-hidden" />}
      <div className="flex items-center gap-1 mt-3 -ml-2">
        <button onClick={toggleLike} className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-muted transition-colors">
          <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <Heart className={`w-5 h-5 ${liked ? "fill-[#5b8fc1] text-[#5b8fc1]" : ""}`} />
          </motion.span>
          <span className="text-sm font-medium">{likes.length}</span>
        </button>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-muted transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comment_count || 0}</span>
        </button>
      </div>
      <CommentsSheet post={post} me={me} open={open} onOpenChange={setOpen} />
    </motion.article>
  );
}