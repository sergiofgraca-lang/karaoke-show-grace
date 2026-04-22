import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useRef, useState } from "react"

function Player() {
  const navigate = useNavigate()
  const location = useLocation()

  const { musica, video } = location.state || {}

  const playerRef = useRef(null)
  const [resultado, setResultado] = useState(null)

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
              // 🔥 remove iframe (ESSENCIAL mobile)
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

    // 🔊 áudio (pode falhar no mobile)
    const audio = new Audio("https://www.myinstants.com/media/sounds/aplausos.mp3")
    audio.play().catch(() => {})
  }

  function salvarNaPlaylist() {
    let playlist = JSON.parse(localStorage.getItem("playlist")) || []

    const musicaAtual = {
      titulo: musica,
      videoId: videoId
    }

    if (!playlist.find(m => m.videoId === musicaAtual.videoId)) {
      playlist.push(musicaAtual)
      localStorage.setItem("playlist", JSON.stringify(playlist))
      alert("Salvo na playlist!")
    } else {
      alert("Já está na playlist!")
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

      {/* 🎥 PLAYER CORRETO (16:9) */}
      {!resultado && (
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          margin: "20px auto",
          paddingBottom: "56.25%" // 16:9
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

      {/* 🎯 RESULTADO */}
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