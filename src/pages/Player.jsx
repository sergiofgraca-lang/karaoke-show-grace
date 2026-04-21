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

  // 🔥 CORRIGIDO: aceita vários formatos de URL
  function pegarVideoId(url) {
    if (!url) return null

    let match = url.match(/v=([^&]+)/) // watch?v=
    if (match) return match[1]

    match = url.match(/embed\/([^?]+)/) // embed/
    if (match) return match[1]

    return null
  }

  const videoId = pegarVideoId(video)

  // 🔥 DEBUG (pode apagar depois)
  console.log("VIDEO:", video)
  console.log("VIDEO ID:", videoId)

  // 🔥 CORRIGIDO: criação segura do player
  useEffect(() => {
    function criarPlayer() {
      if (!videoId) {
        console.log("❌ videoId inválido")
        return
      }

      playerRef.current = new window.YT.Player("player", {
        height: "170",
        width: "300",
        videoId: videoId,
        events: {
          onStateChange: (event) => {
            console.log("Estado:", event.data)

            if (event.data === 0) {
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
  } else {
    emoji = "😬"
    mensagem = "Continue treinando!"
  }

  setResultado({ nota, emoji, mensagem })

  // 🎵 som de aplauso
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
      
      <button
        onClick={() => navigate("/musicas")}
        style={{ marginBottom: "20px" }}
      >
        ⬅ Voltar
      </button>

      <h2>🎤 {musica}</h2>

      <div id="player" style={{ marginTop: "20px" }}></div>

      {resultado && (
  <div style={{
    marginTop: "20px",
    background: "#111",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 0 20px #00ff88"
  }}>
    <h1 style={{ fontSize: "40px" }}>{resultado.emoji}</h1>
    <h2>Nota: {resultado.nota}</h2>
    <h3>{resultado.mensagem}</h3>

    <button onClick={salvarNaPlaylist}>
      💾 Salvar na playlist
    </button>
  </div>
)}
    </div>
  )
}

export default Player