import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useEffect, useRef, useState } from "react"

function Player() {
  const navigate = useNavigate()
  const { videoId } = useParams()
  const location = useLocation()

  const musica = location.state?.musica || "Karaokê"

  const playerRef = useRef(null)
  const [resultado, setResultado] = useState(null)

  const API =
    import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL !== "undefined"
      ? import.meta.env.VITE_API_URL
      : "http://127.0.0.1:8000"

  useEffect(() => {
    function criarPlayer() {
      if (!videoId) return

      playerRef.current = new window.YT.Player("player", {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: (e) => {
            if (e.data === 0) {
              mostrarResultado()
            }
          }
        }
      })
    }

    if (window.YT && window.YT.Player) {
      criarPlayer()
    } else {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.body.appendChild(tag)
      window.onYouTubeIframeAPIReady = criarPlayer
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  function mostrarResultado() {
    const nota = (Math.random() * 4 + 6).toFixed(1)

    let emoji = "😬"
    let mensagem = "Pode melhorar!"

    if (nota >= 9) {
      emoji = "🔥"
      mensagem = "PERFEITO!"
    } else if (nota >= 7) {
      emoji = "😎"
      mensagem = "Mandou bem!"
    }

    setResultado({ nota, emoji, mensagem })

    const audio = new Audio(
      "https://www.myinstants.com/media/sounds/aplausos.mp3"
    )
    audio.play().catch(() => {})
  }

  async function salvarNaPlaylist() {
    const cantor = prompt("🎤 Quem cantou essa música?")

    if (!cantor) return

    try {
      const res = await fetch(`${API}/api/salvar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo: musica,
          videoId,
          cantor
        })
      })

      const data = await res.json()

      if (data.status === "ok") {
        alert("Música salva!")
      } else {
        alert("Erro ao salvar")
      }
    } catch (err) {
      console.error(err)
      alert("Erro servidor")
    }
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "#fff"
      }}
    >
      <button onClick={() => navigate(-1)}>
  ⬅ Voltar
      </button>

      <h2>🎤 {musica}</h2>

      {!resultado && (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "800px",
            margin: "20px auto",
            paddingBottom: "56.25%"
          }}
        >
          <div
            id="player"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
          />
        </div>
      )}

      {resultado && (
        <div>
          <h1>{resultado.emoji}</h1>
          <h2>Nota: {resultado.nota}</h2>
          <p>{resultado.mensagem}</p>

          <button onClick={salvarNaPlaylist}>
            💾 Salvar Música
          </button>
        </div>
      )}
    </div>
  )
}

export default Player