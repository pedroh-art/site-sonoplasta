import { createClient } from "@/lib/supabase/client";

export default async function getsenha() {
    const supabase = createClient();
    const senha = await supabase.from("config").select("value").eq("key", "senha").single();
    return senha;

}