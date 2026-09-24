import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Avatar from "./Avatar";

export default function CommentsSheet({ post, me, open, onOpenChange }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => base44.entities.Comment.filter({ post_id: post.id }, "created_date"),
    enabled: open,
  });

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.entities.Comment.create({ post_id: post.id, content: text.trim(), author_name: me.full_name || me.email });
    await base44.entities.Post.update(post.id, { comment_count: (post.comment_count || 0) + 1 });
    setText(""); setSending(false);
    qc.invalidateQueries({ queryKey: ["comments", post.id] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] flex flex-col max-w-md mx-auto">
        <SheetHeader><SheetTitle className="font-display text-2xl font-normal">Comments</SheetTitle></SheetHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />}
          {!isLoading && comments.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">No comments yet. Start the conversation.</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={c.author_name} size="sm" />
              <div className="bg-muted rounded-2xl px-3.5 py-2.5 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_date), { addSuffix: true })}</span>
                </div>
                <p className="text-sm mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2 pt-3 border-t">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…"
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none" />
          <button disabled={!text.trim() || sending} className="vibe-gradient text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}