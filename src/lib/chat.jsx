import { base44 } from "@/api/base44Client";

export async function openConversation(me, other) {
  const all = await base44.entities.Conversation.list("-updated_date", 100);
  const existing = all.find(
    (c) => c.participants?.length === 2 && c.participants.includes(me.id) && c.participants.includes(other.user_id)
  );
  if (existing) return existing;
  return await base44.entities.Conversation.create({
    participants: [me.id, other.user_id],
    participant_names: [me.full_name || me.email, other.full_name || other.email],
    last_message: "",
    last_message_at: new Date().toISOString(),
  });
}