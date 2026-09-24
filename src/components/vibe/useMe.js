import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
}

export function usePosts() {
  return useQuery({ queryKey: ["posts"], queryFn: () => base44.entities.Post.list("-created_date", 100) });
}

export function useProfiles() {
  return useQuery({ queryKey: ["profiles"], queryFn: () => base44.entities.Profile.list("-created_date", 200) });
}

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => base44.entities.User.list("-created_date", 200) });
}

export function usePeople() {
  const profilesQuery = useProfiles();
  const usersQuery = useUsers();

  const byId = new Map();
  for (const user of usersQuery.data || []) {
    byId.set(user.id, {
      id: user.id,
      user_id: user.id,
      full_name: user.full_name || user.email || "Member",
      email: user.email || "",
      created_date: user.created_date,
    });
  }
  for (const profile of profilesQuery.data || []) {
    const current = byId.get(profile.user_id) || { id: profile.user_id, user_id: profile.user_id };
    byId.set(profile.user_id, { ...current, ...profile, id: profile.user_id, user_id: profile.user_id });
  }

  return {
    data: [...byId.values()],
    isLoading: profilesQuery.isLoading || usersQuery.isLoading,
    error: profilesQuery.error || usersQuery.error,
  };
}

export function useEnsureProfile(me) {
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  useEffect(() => {
    if (!me || !profiles) return;
    if (profiles.some((p) => p.user_id === me.id)) return;
    base44.entities.Profile.create({ user_id: me.id, full_name: me.full_name || me.email, email: me.email })
      .then(() => qc.invalidateQueries({ queryKey: ["profiles"] }));
  }, [me, profiles, qc]);
}