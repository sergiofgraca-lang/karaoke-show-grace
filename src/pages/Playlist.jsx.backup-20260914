import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Playlist.css"
function Playlist() {
  const [musicas, setMusicas] = useState([])
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState("titulo")
  const navigate = useNavigate()
  // ==============================
  // API
  // ==============================
  const API =
    import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL !== "undefined"
      ? import.meta.env.VITE_API_URL
      : "http://127.0.0.1:8000"
  // ==============================
  // CARREGAR MÚSICAS
  // ==============================
  const carregarMusicas = async () => {
    try {
      console.log("🎵 Carregando playlist...")
      const res = await fetch(`${API}/listar/`)
      if (!res.ok) {
        throw new Error(
          `Erro ao buscar músicas: ${res.status}`
        )
      }
      const data = await res.json()
      console.log("🎯 Músicas recebidas:", data)
      if (!Array.isArray(data)) {
        throw new Error(
          "Resposta do servidor não é uma lista de músicas."
        )
      }
      setMusicas(data)
    } catch (err) {
      console.error(
        "❌ Erro ao carregar playlist:",
        err
      )
      alert("Erro ao carregar playlist")
    }
  }
  // ==============================
  // CARREGAR AO ABRIR A PÁGINA
  // ==============================
  useEffect(() => {
    carregarMusicas()
  }, [])
  // ==============================
  // EXCLUIR
  // ==============================
  const deletar = async (id, e) => {
    e.stopPropagation()
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta música?"
    )
    if (!confirmar) {
      return
    }
    try {
      console.log(
        "🗑️ Excluindo música:",
        id
      )
      const res = await fetch(
        `${API}/deletar/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      )
      if (!res.ok) {
        throw new Error(
          `Erro ao deletar: ${res.status}`
        )
      }
      setMusicas((prev) =>
        prev.filter(
          (musica) =>
            musica.id !== id
        )
      )
      console.log(
        "✅ Música excluída com sucesso"
      )
    } catch (err) {
      console.error(
        "❌ Erro ao excluir música:",
        err
      )
      alert(
        "Erro ao excluir música"
      )
    }
  }
  // ==============================
  // TOCAR
  // ==============================
  const tocar = (musica) => {
    if (!musica) {
      return
    }
    if (!musica.videoId) {
      alert(
        "Essa música não possui vídeo associado."
      )
      return
    }
    console.log(
      "▶️ Abrindo Player:",
      musica.titulo,
      musica.videoId
    )
    navigate(
      `/player/${musica.videoId}`,
      {
        state: {
          musica: {
            titulo:
              musica.titulo ||
              "Karaokê",
            videoId:
              musica.videoId,
            cantor:
              musica.cantor || ""
          }
        }
      }
    )
  }
  // ==============================
  // FILTRAR
  // ==============================
  const termo =
    busca.toLowerCase().trim()
  let musicasFiltradas =
    musicas.filter((musica) => {
      if (!termo) {
        return true
      }
      const titulo =
        String(
          musica.titulo || ""
        ).toLowerCase()
      const cantor =
        String(
          musica.cantor || ""
        ).toLowerCase()
      return (
        titulo.includes(termo) ||
        cantor.includes(termo)
      )
    })
  // ==============================
  // ORDENAR
  // ==============================
  musicasFiltradas =
    [...musicasFiltradas].sort(
      (a, b) => {
        if (ordem === "titulo") {
          return (
            String(a.titulo || "").localeCompare(
              String(b.titulo || ""),
              "pt-BR",
              {
                sensitivity: "base"
              }
            )
          )
        }
        if (ordem === "cantor") {
          return (
            String(a.cantor || "").localeCompare(
              String(b.cantor || ""),
              "pt-BR",
              {
                sensitivity: "base"
              }
            )
          )
        }
        if (ordem === "recentes") {
          return (
            Number(b.id || 0) -
            Number(a.id || 0)
          )
        }
        return 0
      }
    )
  // ==============================
  // TELA
  // ==============================
  return (
    <div className="playlist-page">
      <div className="playlist-wrapper">
        {/* =========================
            CABEÇALHO
        ========================= */}
        <header className="playlist-hero">
          <div className="hero-left">
            <button
              className="playlist-back"
              onClick={() =>
                navigate("/")
              }
            >
              ← Voltar
            </button>
            <div className="playlist-brand">
              <div className="brand-icon">
                🎤
              </div>
              <div>
                <div className="brand-small">
                  KARAOKÊ
                </div>
                <h1>
                  Minha Playlist
                </h1>
                <p>
                  Todas as suas músicas
                  salvas em um só lugar
                </p>
              </div>
            </div>
          </div>
          <div className="playlist-counter">
            <span className="counter-icon">
              🎵
            </span>
            <strong>
              {musicas.length}
            </strong>
            <span>
              {musicas.length === 1
                ? "música"
                : "músicas"}
            </span>
          </div>
        </header>
        {/* =========================
            ÁREA DE CONTROLE
        ========================= */}
        <section className="playlist-controls">
          <div className="search-box">
            <span className="search-icon">
              🔎
            </span>
            <input
              type="text"
              value={busca}
              placeholder="Buscar por música ou cantor..."
              onChange={(e) =>
                setBusca(
                  e.target.value
                )
              }
            />
            {busca && (
              <button
                className="clear-search"
                onClick={() =>
                  setBusca("")
                }
              >
                ×
              </button>
            )}
          </div>
          <div className="playlist-options">
            <div className="result-count">
              <strong>
                {musicasFiltradas.length}
              </strong>
              <span>
                {musicasFiltradas.length === 1
                  ? " música encontrada"
                  : " músicas encontradas"}
              </span>
            </div>
            <div className="sort-box">
              <span>
                Ordenar:
              </span>
              <select
                value={ordem}
                onChange={(e) =>
                  setOrdem(
                    e.target.value
                  )
                }
              >
                <option value="titulo">
                  A-Z
                </option>
                <option value="cantor">
                  Cantor
                </option>
                <option value="recentes">
                  Mais recentes
                </option>
              </select>
            </div>
          </div>
        </section>
        {/* =========================
            LISTA
        ========================= */}
        <section className="playlist-content">
          {/* PLAYLIST VAZIA */}
          {musicas.length === 0 && (
            <div className="empty-playlist">
              <div className="empty-icon">
                🎵
              </div>
              <h2>
                Sua playlist está vazia
              </h2>
              <p>
                Pesquise e salve músicas
                para começar seu karaokê.
              </p>
            </div>
          )}
          {/* NENHUM RESULTADO */}
          {musicas.length > 0 &&
            musicasFiltradas.length === 0 && (
              <div className="empty-playlist">
                <div className="empty-icon">
                  🔎
                </div>
                <h2>
                  Nenhuma música encontrada
                </h2>
                <p>
                  Não encontramos resultados
                  para:
                </p>
                <strong>
                  "{busca}"
                </strong>
              </div>
            )}
          {/* =========================
              MÚSICAS
          ========================= */}
          {musicasFiltradas.map(
            (musica, index) => (
              <article
                key={musica.id}
                className="song-row"
                onClick={() =>
                  tocar(musica)
                }
              >
                {/* NÚMERO */}
                <div className="song-number">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </div>
                {/* PLAY */}
                <div className="song-play">
                  ▶
                </div>
                {/* INFORMAÇÕES */}
                <div className="song-info">
                  <div className="song-title">
                    {musica.titulo ||
                      "Sem título"}
                  </div>
                  <div className="song-artist">
                    🎤{" "}
                    {musica.cantor ||
                      "Cantor não informado"}
                  </div>
                </div>
                {/* AÇÕES */}
                <div className="song-action">
                  <span className="play-text">
                    Cantar
                  </span>
                  <button
                    className="delete-button"
                    title="Excluir música"
                    onClick={(e) =>
                      deletar(
                        musica.id,
                        e
                      )
                    }
                  >
                    🗑
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      </div>
    </div>
  )
}
export default Playlist
