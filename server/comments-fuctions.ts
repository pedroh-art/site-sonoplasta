import { createClient } from "@/lib/supabase/client";
// busca comentários de uma trilha específica
export async function getComments(trackId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("track_id", trackId)       // filtra pela música
    .order("created_at", { ascending: true });
  return data;
}

// adiciona um comentário
export async function addComment(trackId: string, author: string, content: string) {
  const supabase = createClient();
  await supabase.from("comments").insert({ track_id: trackId, author, content });
}
