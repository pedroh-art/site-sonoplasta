// lib/tracks.ts
import { createClient } from "@/lib/supabase/client";

export async function uploadTrack(title: string, file: File) {
  const supabase = createClient();

  // ETAPA 1 — envia o arquivo pro Storage (bucket "audios")
  const fileName = `${Date.now()}-${file.name}`; // nome único pra não sobrescrever
  const { error: storageError } = await supabase.storage
    .from("audios")
    .upload(fileName, file);

  if (storageError) throw new Error(storageError.message);

  // ETAPA 2 — pega a URL pública do arquivo que acabou de subir
  const { data } = supabase.storage.from("audios").getPublicUrl(fileName);

  // ETAPA 3 — salva título + URL no banco (tabela "tracks")
  const { error: dbError } = await supabase
    .from("tracks")
    .insert({ title, file_url: data.publicUrl });

  if (dbError) throw new Error(dbError.message);
}
// adiciona isso no lib/tracks.ts
export async function deleteTrack(trackId: string, fileUrl: string) {
  const supabase = createClient();

  // ETAPA 1 — extrai o nome do arquivo da URL
  // a URL é tipo: https://xxx.supabase.co/storage/v1/object/public/audios/1234-musica.mp3
  const fileName = fileUrl.split("/audios/")[1];

  // ETAPA 2 — deleta o arquivo do Storage
  const { error: storageError } = await supabase.storage
    .from("audios")
    .remove([fileName]);

  if (storageError) throw new Error(storageError.message);

  // ETAPA 3 — deleta a trilha do banco (comentários somem junto pelo cascade)
  const { error: dbError } = await supabase
    .from("tracks")
    .delete()
    .eq("id", trackId);

  if (dbError) throw new Error(dbError.message);
}