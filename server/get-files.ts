import { createClient } from "@/lib/supabase/client";

export async function getTracks() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false }); // mais recentes primeiro

  if (error) throw new Error(error.message);
  return data; // array de { id, title, file_url, created_at }
}