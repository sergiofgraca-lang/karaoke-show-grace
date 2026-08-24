import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Playlist.css"

function Playlist() {
  const [musicas, setMusicas] = useState([])
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState("titulo")

  const navigate = useNavigate()

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
      const res = await fetch(`${API}/listar/`)

      if (!res.ok) {
        throw new Error("Erro ao buscar músicas")
      }

      const data = await res.json()

      setMusicas(data)
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar playlist")
    }
  }

  useEffect(() => {
    carregarMusicas()
  }, [])

  // ==============================
  // EXCLUIR
  // ==============================

  const deletar = async (id, e) => {
    e.stopPropagation()

    const confirmar = confirm("Excluir música?")

    if (!confirmar) return

    try {
      const res = await fetch(`${API}/deletar/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!res.ok) {
        throw new Error("Erro ao deletar")
      }

      setMusicas((prev) =>
        prev.filter((m) => m.id !== id)
      )
    } catch (err) {
      console.error(err)
      alert("Erro ao excluir música")
    }
  }

  // ==============================
  // TOCAR
  // ==============================

  const tocar = (videoId) => {
    if (!videoId) {
      alert("Essa música não tem vídeo")
      return
    }

    navigate(`/player/${videoId}`)
  }

  // ==============================
  // FILTRAR
  // ==============================

 let musicasFiltradas = musicas.filter((musica, index) => {
  const termo = busca.toLowerCase().trim()

  if (!termo) {
    return true
  }

  const titulo = (musica.titulo || "").toLowerCase()
  const cantor = (musica.cantor || "").toLowerCase()

  const numero = String(index + 1)

  const numeroBuscado = termo.replace(/^0+/, "") || "0"

  return (
    titulo.includes(termo) ||
    cantor.includes(termo) ||
    numero === numeroBuscado
  )
})

  // ==============================
  // ORDENAR
  // ==============================

  musicasFiltradas = [...musicasFiltradas].sort((a, b) => {

    if (ordem === "titulo") {
      return (a.titulo || "").localeCompare(
        b.titulo || "",
        "pt-BR"
      )
    }

    if (ordem === "cantor") {
      return (a.cantor || "").localeCompare(
        b.cantor || "",
        "pt-BR"
      )
    }

    if (ordem === "recentes") {
      return b.id - a.id
    }

    return 0
  })

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
              onClick={() => navigate("/")}
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
                  Todas as suas músicas salvas em um só lugar
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
              músicas
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
                setBusca(e.target.value)
              }
            />

            {busca && (
              <button
                className="clear-search"
                onClick={() => setBusca("")}
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
                  setOrdem(e.target.value)
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

          {musicas.length === 0 && (
            <div className="empty-playlist">

              <div className="empty-icon">
                🎵
              </div>

              <h2>
                Sua playlist está vazia
              </h2>

              <p>
                Pesquise e salve músicas para
                começar seu karaokê.
              </p>

            </div>
          )}

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
                  Não encontramos resultados para:
                </p>

                <strong>
                  "{busca}"
                </strong>

              </div>
            )}

          {musicasFiltradas.map((musica, index) => (

            <article
              key={musica.id}
              className="song-row"
              onClick={() =>
                tocar(musica.videoId)
              }
            >

              <div className="song-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="song-play">
                ▶
              </div>

              <div className="song-info">

                <div className="song-title">
                  {musica.titulo}
                </div>

                <div className="song-artist">
                  🎤 {musica.cantor}
                </div>

              </div>

              <div className="song-action">

                <span className="play-text">
                  Cantar
                </span>

                <button
                  className="delete-button"
                  title="Excluir música"
                  onClick={(e) =>
                    deletar(musica.id, e)
                  }
                >
                  🗑
                </button>

              </div>

            </article>

          ))}

        </section>

      </div>

    </div>
  )
}

export default Playlist