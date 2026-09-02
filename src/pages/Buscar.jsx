import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Buscar() {
  const [busca, setBusca] = useState("")
  const [videos, setVideos] = useState([])

  // Música selecionada para cadastro
  const [musicaSelecionada, setMusicaSelecionada] =
    useState(null)

  // Nome do cantor/artista
  const [cantor, setCantor] = useState("")

  const navigate = useNavigate()

  // =========================================================
  // API
  // =========================================================

  const API_KEY =
    import.meta.env.VITE_YOUTUBE_KEY

  const API =
    import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL !== "undefined"
      ? import.meta.env.VITE_API_URL
      : "http://127.0.0.1:8000/api"

  // =========================================================
  // BUSCAR MÚSICA NO YOUTUBE
  // =========================================================

  async function buscarMusica() {
    if (!busca.trim()) {
      return
    }

    try {
      console.log(
        "🔎 Buscando no YouTube:",
        busca
      )

      const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet` +
        `&q=${encodeURIComponent(busca)}+karaoke` +
        `&type=video` +
        `&maxResults=10` +
        `&key=${API_KEY}`

      const res = await fetch(url)

      const data = await res.json()

      if (!res.ok) {
        console.error(
          "❌ Erro YouTube:",
          data
        )

        alert(
          "Erro ao buscar músicas no YouTube."
        )

        return
      }

      const filtrados =
        (data.items || []).filter(
          (v) =>
            v.id &&
            v.id.videoId
        )

      console.log(
        "🎵 Resultados encontrados:",
        filtrados.length
      )

      setVideos(filtrados)
    } catch (err) {
      console.error(
        "❌ Erro ao buscar:",
        err
      )

      alert(
        "Erro ao buscar no YouTube."
      )
    }
  }

  // =========================================================
  // SELECIONAR MÚSICA
  // =========================================================

  function selecionarMusica(video) {
    const videoId =
      video?.id?.videoId

    if (!videoId) {
      return
    }

    const musica = {
      titulo:
        video.snippet?.title ||
        "Karaokê",

      videoId,

      cantor: ""
    }

    console.log(
      "🎵 Música selecionada:",
      musica
    )

    setMusicaSelecionada(
      musica
    )

    setCantor("")
  }

  // =========================================================
  // SALVAR MÚSICA NO DJANGO
  // =========================================================

  async function salvarMusica() {
    if (!musicaSelecionada) {
      return
    }

    if (!cantor.trim()) {
      alert(
        "🎤 Informe o nome do cantor ou artista."
      )

      return
    }

    const musica = {
      ...musicaSelecionada,
      cantor: cantor.trim()
    }

    try {
      console.log(
        "💾 Salvando música no Django:",
        musica
      )

      const res =
        await fetch(
          `${API}/salvar/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              titulo:
                musica.titulo,

              videoId:
                musica.videoId,

              cantor:
                musica.cantor
            })
          }
        )

      console.log(
        "📡 Status Django:",
        res.status
      )

      const data =
        await res.json()

      console.log(
        "📦 Resposta Django:",
        data
      )

      if (!res.ok) {
        throw new Error(
          data.erro ||
          "Erro ao salvar música"
        )
      }

      console.log(
        "✅ Música salva no banco!"
      )

      console.log(
        "🆔 ID:",
        data.id
      )

      if (data.audio) {
        console.log(
          "🎧 Áudio encontrado:",
          data.audio
        )
      }

      // =====================================================
      // ABRIR PLAYER
      // =====================================================

      console.log(
        "🎬 Abrindo Player..."
      )

      navigate(
        `/player/${musica.videoId}`,
        {
          state: {
            musica
          }
        }
      )
    } catch (err) {
      console.error(
        "❌ Erro ao salvar música:",
        err
      )

      alert(
        err.message ||
        "Não foi possível salvar a música no Django."
      )
    }
  }

  // =========================================================
  // CANCELAR SELEÇÃO
  // =========================================================

  function cancelarSelecao() {
    setMusicaSelecionada(null)
    setCantor("")
  }

  // =========================================================
  // TELA
  // =========================================================

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        color: "#fff"
      }}
    >
      {/* =====================================================
          VOLTAR
      ===================================================== */}

      <button
        onClick={() =>
          navigate("/")
        }
      >
        ⬅ Voltar
      </button>

      <h1>
        🔎 Buscar Música
      </h1>

      {/* =====================================================
          BUSCA
      ===================================================== */}

      <input
        value={busca}
        onChange={(e) =>
          setBusca(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            buscarMusica()
          }
        }}
        placeholder="Digite a música"
        style={{
          padding: "10px",
          width: "70%"
        }}
      />

      <br />
      <br />

      <button
        onClick={
          buscarMusica
        }
      >
        🔎 Buscar
      </button>

      {/* =====================================================
          FORMULÁRIO DA MÚSICA SELECIONADA
      ===================================================== */}

      {musicaSelecionada && (
        <div
          style={{
            maxWidth: "600px",
            margin: "30px auto",
            padding: "20px",
            backgroundColor:
              "#1e1e1e",
            borderRadius: "12px"
          }}
        >
          <h2>
            🎵 Música selecionada
          </h2>

          <p>
            <strong>
              {musicaSelecionada.titulo}
            </strong>
          </p>

          <p
            style={{
              color: "#aaa",
              fontSize: "14px"
            }}
          >
            VideoId:{" "}
            {musicaSelecionada.videoId}
          </p>

          {/* =================================================
              CANTOR / ARTISTA
          ================================================= */}

          <div
            style={{
              marginTop: "20px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold"
              }}
            >
              🎤 Cantor / Artista
            </label>

            <input
              value={cantor}
              onChange={(e) =>
                setCantor(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  salvarMusica()
                }
              }}
              placeholder="Digite o nome do cantor ou artista"
              autoFocus
              style={{
                padding: "12px",
                width: "90%",
                maxWidth: "450px",
                borderRadius: "6px",
                border: "1px solid #555",
                fontSize: "16px"
              }}
            />
          </div>

          {/* =================================================
              BOTÕES
          ================================================= */}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent:
                "center",
              gap: "10px"
            }}
          >
            <button
              onClick={
                salvarMusica
              }
              style={{
                padding:
                  "10px 20px",
                cursor:
                  "pointer"
              }}
            >
              💾 Salvar e Abrir
            </button>

            <button
              onClick={
                cancelarSelecao
              }
              style={{
                padding:
                  "10px 20px",
                cursor:
                  "pointer"
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          RESULTADOS
      ===================================================== */}

      <div
        style={{
          marginTop: "20px"
        }}
      >
        {videos.map(
          (video) => {
            const videoId =
              video.id.videoId

            const titulo =
              video.snippet?.title ||
              "Karaokê"

            return (
              <div
                key={videoId}
                onClick={() =>
                  selecionarMusica(
                    video
                  )
                }
                style={{
                  cursor:
                    "pointer",
                  marginBottom:
                    "15px",
                  padding: "10px",
                  borderRadius:
                    "10px"
                }}
              >
                <img
                  src={
                    video.snippet
                      .thumbnails
                      .medium.url
                  }
                  width="120"
                  alt={titulo}
                />

                <p>
                  {titulo}
                </p>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}

export default Buscar