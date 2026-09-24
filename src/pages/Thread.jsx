import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useMe } from "@/components/vibe/useMe";
import Avatar from "@/components/vibe/Avatar";

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const { data: convo } = useQuery({ queryKey: ["conversation", id], queryFn: () => base44.entities.Conversation.get(id) });
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: id }, "created_date"),
  });

  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === id) qc.invalidateQueries({ queryKey: ["messages", id] });
    }, { conversation_id: id });
    return unsub;
  }, [id, qc]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  if (!me) return null;
  const i = convo?.participants?.indexOf(me.id) ?? -1;
  const name = i >= 0 ? convo.participant_names?.[i === 0 ? 1 : 0] || "Member" : "Conversation";

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const body = text.trim();
    setText("");
    await base44.entities.Message.create({ conversation_id: id, content: body, author_id: me.id, author_name: me.full_name || me.email });
    await base44.entities.Conversation.update(id, { last_message: body, last_message_at: new Date().toISOString() });
    setSending(false);
    qc.invalidateQueries({ queryKey: ["messages", id] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-background/85 backdrop-blur-xl">
        <button onClick={() => navigate("/messages")} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
        <Avatar name={name} size="sm" />
        <p className="font-semibold text-[15px] truncate">{name}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />}
        {!isLoading && messages.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Say something.</p>}
        {messages.map((m) => {
          const own = m.author_id === me.id;
          return (
            <div key={m.id} className={`max-w-[78%] px-4 py-2.5 rounded-3xl ${own ? "vibe-gradient text-white ml-auto rounded-br-lg" : "bg-muted rounded-bl-lg"}`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              <p className={`text-[10px] mt-1 ${own ? "text-white/70" : "text-muted-foreground"}`}>
                {formatDistanceToNow(new Date(m.created_date), { addSuffix: true })}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…"
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none" />
        <button disabled={!text.trim() || sending} className="vibe-gradient text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}