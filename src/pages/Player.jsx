import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useRef, useState } from "react"

function Player() {
  const navigate = useNavigate()
  const location = useLocation()

  const { musica, video } = location.state || {}

  const playerRef = useRef(null)
  const [resultado, setResultado] = useState(null)

  const API = import.meta.env.VITE_API_URL // 🔥 backend local

  if (!musica) return <h2>Erro: música não encontrada</h2>

  function getId(url) {
    if (!url) return null
    const match = url.match(/v=([^&]+)/)
    return match ? match[1] : null
  }

  const videoId = getId(video)

  useEffect(() => {
    function criarPlayer() {
      if (!videoId) return

      playerRef.current = new window.YT.Player("player", {
        videoId: videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: (e) => {
            if (e.data === 0) {
              playerRef.current.destroy()
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
      mensagem = "PERFEITO! VOCÊ É UMA LENDA!"
    } else if (nota >= 7) {
      emoji = "😎"
      mensagem = "Mandou bem demais!"
    }

    setResultado({ nota, emoji, mensagem })

    const audio = new Audio("https://www.myinstants.com/media/sounds/aplausos.mp3")
    audio.play().catch(() => {})
  }

  // 🔥 AGORA SALVA NO DJANGO
  async function salvarNaPlaylist() {
    const cantor = prompt("🎤 Quem cantou essa música?")

    if (!cantor) {
      alert("Digite o nome do cantor!")
      return
    }

    try {
      const res = await fetch(`${API}/api/salvar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo: musica,
          videoId: videoId,
          cantor: cantor
        })
      })

      const data = await res.json()

      if (data.status === "ok") {
        alert(`Salvo no banco! 🎶 Cantor: ${cantor}`)
      } else {
        alert("Erro ao salvar")
      }

    } catch (err) {
      alert("Erro ao conectar com servidor")
    }
  }

  return (
    <div style={{
      textAlign: "center",
      padding: "20px",
      backgroundColor: "#121212",
      minHeight: "100vh",
      color: "#fff"
    }}>

      <button onClick={() => navigate("/buscar")}>
        ⬅ Voltar
      </button>

      <h2 style={{ marginTop: "10px" }}>
        🎤 {musica}
      </h2>

      {!resultado && (
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          margin: "20px auto",
          paddingBottom: "56.25%"
        }}>
          <div
            id="player"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          />
        </div>
      )}

      {resultado && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "20px",
          textAlign: "center"
        }}>

          <div style={{ fontSize: "80px" }}>
            {resultado.emoji}
          </div>

          <h2 style={{ fontSize: "32px" }}>
            Nota: {resultado.nota}
          </h2>

          <h3 style={{ color: "#ccc" }}>
            {resultado.mensagem}
          </h3>

          <button
            onClick={salvarNaPlaylist}
            style={{
              marginTop: "20px",
              padding: "12px 25px",
              borderRadius: "10px",
              border: "none",
              background: "#00c853",
              color: "#fff"
            }}
          >
            💾 Salvar
          </button>

          <button
            onClick={() => setResultado(null)}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#444",
              color: "#fff"
            }}
          >
            ❌ Fechar
          </button>

        </div>
      )}
    </div>
  )
}

export default Player