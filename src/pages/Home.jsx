import { useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"

function Home() {
  const navigate = useNavigate()
  const [quantidade, setQuantidade] = useState(0)
  const audioRef = useRef(null)

  function atualizarPlaylist() {
    const dados = JSON.parse(localStorage.getItem("playlist")) || []
    setQuantidade(dados.length)
  }

  useEffect(() => {
    atualizarPlaylist()

    window.addEventListener("focus", atualizarPlaylist)

    // 🎵 Música de fundo (corrigido p/ mobile)
    if (audioRef.current) {
      audioRef.current.volume = 0.2

      const playAudio = () => {
        audioRef.current.play().catch(() => {})
        document.removeEventListener("click", playAudio)
      }

      document.addEventListener("click", playAudio)
    }

    return () => {
      window.removeEventListener("focus", atualizarPlaylist)
    }
  }, [])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      padding: "20px"
    }}>

      {/* 🎵 Música */}
      <audio
        ref={audioRef}
        src="https://www.bensound.com/bensound-music/bensound-dance.mp3"
        loop
      />

      <h1>🎤 Karaoke Show Grace</h1>
      <p>Escolha sua música e solte a voz! 🎶</p>

      {/* 🔥 CONTAINER DOS BOTÕES (FORÇA VERTICAL) */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginTop: "30px",
        width: "100%",
        maxWidth: "260px"
      }}>

        <button style={botao} onClick={() => navigate("/buscar")}>
          🔎 Buscar Música
        </button>

        <button style={botao} onClick={() => navigate("/playlist")}>
          🎶 Minha Playlist ({quantidade})
        </button>

        <button
          style={{ ...botao, backgroundColor: "#555" }}
          onClick={() => {
            localStorage.removeItem("logado")
            navigate("/login")
          }}
        >
          🚪 Sair
        </button>

      </div>
    </div>
  )
}

const botao = {
  width: "100%",
  padding: "15px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#ff0000",
  color: "#fff"
}

export default Home