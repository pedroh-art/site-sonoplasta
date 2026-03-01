"use client";

import { useEffect, useState, useRef } from "react";
import { getComments, addComment } from "@/server/comments-fuctions";
import { getTracks } from "@/server/get-files";
import { uploadTrack, deleteTrack } from "@/server/upload-files";
import getsenha from "@/server/get-senha";

// --- Tipos ---
type Track = {
  id: string;
  title: string;
  file_url: string;
  created_at?: string;
};

type Comment = {
  id: string;
  author: string;
  content: string;
  created_at: string;
};

// --- Componentes de Ícone (SVG) ---
const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const UploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const MusicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
);
const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);

// --- Componente Principal ---
export default function MusicApp() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(true);
  
  // Estados do formulário
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sistema de Notificação Simples
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    setLoadingTracks(true);
    try {
      const data = await getTracks();
      if (data) setTracks(data);
    } catch (error) {
      console.error("Erro ao carregar músicas:", error);
      showToast("Erro ao carregar lista de músicas.", "error");
    } finally {
      setLoadingTracks(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!newFile || !newTitle) return;

    setUploading(true);
    try {
      await uploadTrack(newTitle, newFile);
      setNewTitle("");
      setNewFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      await loadTracks();
      showToast("Música enviada com sucesso!", "success");
    } catch (error) {
      console.error("Erro no upload:", error);
      showToast("Falha ao enviar música.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteTrack(trackId: string, fileUrl: string) {
    if (!confirm("Tem certeza que deseja excluir esta faixa?")) return;

    // Optimistic Update: Remove da UI imediatamente
    const previousTracks = [...tracks];
    setTracks(tracks.filter(t => t.id !== trackId));

    try {
      await deleteTrack(trackId, fileUrl);
      showToast("Faixa excluída.", "success");
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setTracks(previousTracks); // Reverte se der erro
      showToast("Erro ao excluir faixa.", "error");
    }
  }
  const [ok, setOk] = useState(false);
  const [input, setInput] = useState("");
  async function verificarSenha() {
  const senha = await getsenha();
  if (input === senha.toString()) {
    setOk(true);
  } else {
    alert("Senha incorreta");
  }
}
  if (!ok) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col gap-3 w-72">
        <p className="text-white text-center font-semibold">🎭 Clube do Livro</p>
        <input
          type="password"
          placeholder="Digite a senha"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none"
        />
        <button
  onClick={verificarSenha}
  className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm"
>
  Entrar
</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <main className="max-w-5xl mx-auto p-6 lg:p-10">
        <header className="mb-12 text-center space-y-2">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Clube do Livro Player
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Compartilhe e discuta seus áudios favoritos</p>
        </header>

        {/* Seção de Upload */}
        <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-12 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
              <UploadIcon />
            </div>
            <h2 className="text-xl font-bold">Nova Faixa</h2>
          </div>
          
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-stretch">
            <input
              type="text"
              placeholder="Título da música"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
            <div className="relative flex-1">
              <input
                type="file"
                accept="audio/*"
                ref={fileInputRef}
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                required
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span className="animate-pulse">Enviando...</span>
              ) : (
                <>Enviar <UploadIcon className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </section>

        {/* Lista de Músicas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MusicIcon className="text-purple-500" /> Biblioteca
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {tracks.length} faixas
            </span>
          </div>

          {loadingTracks ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">Nenhuma música encontrada. Adicione a primeira!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {tracks.map((track) => (
                <TrackCard 
                  key={track.id} 
                  track={track} 
                  onDelete={() => handleDeleteTrack(track.id, track.file_url)} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// --- Componente de Cartão de Música ---
function TrackCard({ track, onDelete }: { track: Track; onDelete: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, track.id]);

  async function fetchComments() {
    setLoadingComments(true);
    try {
      const data = await getComments(track.id);
      if (data) setComments(data);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!author || !content) return;

    // Optimistic update para comentários
    const tempId = Math.random().toString();
    const newComment: Comment = {
      id: tempId,
      author,
      content,
      created_at: new Date().toISOString()
    };
    
    setComments([...comments, newComment]);
    setAuthor("");
    setContent("");

    try {
      await addComment(track.id, author, content);
      await fetchComments(); // Revalida com dados reais do servidor
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      setComments(comments.filter(c => c.id !== tempId)); // Reverte em caso de erro
    }
  }

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Header do Card */}
      <div className="p-6 pb-4 relative">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Excluir faixa"
          >
            <TrashIcon />
          </button>
        </div>
        
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <MusicIcon className="w-6 h-6" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1" title={track.title}>
          {track.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-4">
          Áudio
        </p>

        {/* Player Customizado (Wrapper no nativo) */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
          <audio 
            controls 
            src={track.file_url} 
            className="w-full h-8 [&::-webkit-media-controls-panel]:bg-transparent"
          >
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      </div>

      {/* Footer / Comentários */}
      <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="w-full px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {showComments ? "Ocultar comentários" : "Ver comentários"}
          </span>
          {comments.length > 0 && (
            <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          )}
        </button>

        {showComments && (
          <div className="px-6 pb-6 animate-fade-in">
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {loadingComments && comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-2">Carregando...</p>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-2 italic">Seja o primeiro a comentar!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-sm">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{comment.author}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escreva um comentário..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    title="Enviar comentário"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
