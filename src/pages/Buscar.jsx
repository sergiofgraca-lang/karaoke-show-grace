import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Buscar() {
  const [busca, setBusca] = useState("");
  const [videos, setVideos] = useState([]);

  // Música selecionada para cadastro
  const [musicaSelecionada, setMusicaSelecionada] = useState(null);

  // Nome do cantor/artista
  const [cantor, setCantor] = useState("");

  const navigate = useNavigate();

  // =========================================================
  // CONFIGURAÇÃO DOS ENDPOINTS DA API
  // =========================================================
  const API_KEY = import.meta.env.VITE_YOUTUBE_KEY;

  const API =
    import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== "undefined"
      ? import.meta.env.VITE_API_URL
      : "https://vercel.app";

  // =========================================================
  // BUSCAR MÚSICA NO YOUTUBE (MÁXIMO 10 RESULTADOS)
  // =========================================================
  async function buscarMusica() {
    if (!busca.trim()) {
      return;
    }

    try {
      console.log("🔎 Buscando no YouTube:", busca);

      const url =
        `https://googleapis.com` +
        `?part=snippet` +
        `&q=${encodeURIComponent(busca)}+karaoke` +
        `&type=video` +
        `&maxResults=10` +
        `&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Erro YouTube:", data);
        alert("Erro ao buscar músicas no YouTube.");
        return;
      }

      const filtrados = (data.items || []).filter(
        (v) => v.id && v.id.videoId
      );

      console.log("🎵 Resultados encontrados:", filtrados.length);
      setVideos(filtrados);

    } catch (err) {
      console.error("❌ Erro ao buscar:", err);
      alert("Erro ao buscar no YouTube.");
    }
  }

  // =========================================================
  // SELECIONAR MÚSICA DA LISTA DO YOUTUBE
  // =========================================================
  function selecionarMusica(video) {
    const videoId = video?.id?.videoId;

    if (!videoId) {
      console.warn("⚠️ Vídeo selecionado não possui um videoId válido.");
      return;
    }

    const infoMusica = {
      titulo: video.snippet?.title || "Karaokê Sem Título",
      videoId: videoId
    };

    console.log("🎵 Música selecionada para o formulário:", infoMusica);
    setMusicaSelecionada(infoMusica);
    setCantor("");
  }

  // =========================================================
  // SALVAR MÚSICA NO DJANGO (ENVIO PRO SUPABASE STORAGE)
  // =========================================================
  async function salvarMusica(musicaItem) {
    try {
      const idDoVideo = musicaItem?.videoId || musicaSelecionada?.videoId;
      const tituloDaMusica = musicaItem?.titulo || musicaSelecionada?.titulo || "Karaoke";

      console.log("💾 Salvando música no Django:", {
        videoId: idDoVideo,
        titulo: tituloDaMusica
      });

      if (!idDoVideo) {
        console.warn("⚠️ Operação cancelada: videoId não encontrado.");
        return;
      }

      const resposta = await fetch(`${API}/salvar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: idDoVideo,
          titulo: tituloDaMusica,
          cantor: cantor || "Sergio"
        }),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível processar o áudio do YouTube.");
      }

      const dados = await resposta.json();
      console.log("📡 Resposta Django recebida com sucesso:", dados);

      if (dados && (dados.id || dados.videoId)) {
        console.log("🎬 Redirecionando para o Player com o ID:", idDoVideo);
        navigate(`/player/${idDoVideo}`, { 
          state: { musica: dados } 
        });
      } else {
        throw new Error("Dados de retorno inválidos do servidor.");
      }

    } catch (erro) {
      console.error("❌ Erro ao salvar música:", erro);
    }
  }

  // =========================================================
  // CANCELAR SELEÇÃO
  // =========================================================
  function cancelarSelecao() {
    setMusicaSelecionada(null);
    setCantor("");
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>🔎 Buscar Karaokê</h2>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome da música ou artista..."
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          onKeyDown={(e) => e.key === "Enter" && buscarMusica()}
        />
        <button onClick={buscarMusica} style={{ padding: "10px 20px", borderRadius: "5px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" }}>
          Buscar
        </button>
      </div>

      {musicaSelecionada && (
        <div style={{ padding: "15px", border: "1px solid #28a745", borderRadius: "5px", backgroundColor: "#e2f0d9", marginBottom: "20px" }}>
          <h4>📌 Confirmar Cadastro</h4>
          <p><strong>Música:</strong> {musicaSelecionada.titulo}</p>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Cantor/Cantora:</label>
            <input
              type="text"
              value={cantor}
              onChange={(e) => setCantor(e.target.value)}
              placeholder="Quem vai cantar?"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => salvarMusica(musicaSelecionada)} style={{ padding: "8px 15px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}>
              Salvar na Playlist
            </button>
            <button onClick={cancelarSelecao} style={{ padding: "8px 15px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {videos.map((video) => (
          <div key={video.id.videoId} style={{ display: "flex", gap: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "5px", alignItems: "center" }}>
            <img src={video.snippet?.thumbnails?.default?.url} alt="thumbnail" style={{ width: "120px", borderRadius: "3px" }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{video.snippet?.title}</h4>
              <button onClick={() => selecionarMusica(video)} style={{ padding: "5px 10px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}>
                Selecionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
