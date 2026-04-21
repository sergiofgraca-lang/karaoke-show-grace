import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useRef, useState } from "react"

function Player() {
  const navigate = useNavigate()
  const location = useLocation()

  const { musica, video } = location.state || {}

  const playerRef = useRef(null)
  const [resultado, setResultado] = useState(null)

  if (!musica) {
    return <h2>Erro: música não encontrada</h2>
  }

  function pegarVideoId(url) {
    if (!url) return null

    let match = url.match(/v=([^&]+)/)
    if (match) return match[1]

    match = url.match(/embed\/([^?]+)/)
    if (match) return match[1]

    return null
  }

  const videoId = pegarVideoId(video)

  useEffect(() => {
    function criarPlayer() {
      if (!videoId) return

      playerRef.current = new window.YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        events: {
          onStateChange: (event) => {
            if (event.data === 0) {
              // 🔥 PARA o vídeo
              playerRef.current.stopVideo()

              // 🔥 MOSTRA resultado
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
    audio.play()
  }

  function salvarNaPlaylist() {
    let playlist = JSON.parse(localStorage.getItem("playlist")) || []

    const musicaAtual = {
      titulo: musica,
      videoId: videoId
    }

    const existe = playlist.find(m => m.videoId === musicaAtual.videoId)

    if (!existe) {
      playlist.push(musicaAtual)
      localStorage.setItem("playlist", JSON.stringify(playlist))
      alert("Salvo na playlist!")
    } else {
      alert("Já está na playlist!")
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      
      <button onClick={() => navigate("/buscar")}>
        ⬅ Voltar
      </button>

      <h2>🎤 {musica}</h2>

      {/* 🔥 PLAYER ESCONDE QUANDO MOSTRA RESULTADO */}
      <div style={{
        position: "relative",
        width: "90%",
        maxWidth: "800px",
        margin: "20px auto",
        paddingBottom: "56.25%",
        display: resultado ? "none" : "block" // 🔥 CORREÇÃO PRINCIPAL
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
        ></div>
      </div>

      {/* 🎯 RESULTADO */}
      {resultado && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.98)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "20px",
          textAlign: "center"
        }}>

          <div style={{
            fontSize: "clamp(60px, 15vw, 100px)",
            marginBottom: "10px"
          }}>
            {resultado.emoji}
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 8vw, 42px)"
          }}>
            Nota: {resultado.nota}
          </h2>

          <h3 style={{
            marginBottom: "25px",
            color: "#ccc"
          }}>
            {resultado.mensagem}
          </h3>

          <button
            onClick={salvarNaPlaylist}
            style={{
              padding: "14px 30px",
              borderRadius: "12px",
              border: "none",
              background: "#00c853",
              color: "#fff",
              marginBottom: "10px"
            }}
          >
            💾 Salvar na playlist
          </button>

          <button
            onClick={() => setResultado(null)}
            style={{
              padding: "12px 25px",
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