import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function Home() {
  const navigate = useNavigate()
  const [quantidade, setQuantidade] = useState(0)

  function atualizarPlaylist() {
    const dados = JSON.parse(localStorage.getItem("playlist")) || []
    setQuantidade(dados.length)
  }

  useEffect(() => {
    atualizarPlaylist()

    window.addEventListener("focus", atualizarPlaylist)

    return () => {
      window.removeEventListener("focus", atualizarPlaylist)
    }
  }, [])

  return (
    <div style={{
      textAlign: "center",
      marginTop: "50px",
      backgroundColor: "#0f0f0f",
      minHeight: "100vh",
      color: "#fff",
      position: "relative",
      zIndex: 1,
      transform: "translateZ(0)" // 🔥 força render no mobile
    }}>
      
      {/* 🔥 TÍTULO PRINCIPAL */}
      <h1 style={{
        color: "#ffffff",
        position: "relative",
        zIndex: 10,
        textShadow: "0 0 10px rgba(0,0,0,0.8)",
        transform: "translateZ(0)"
      }}>
        🎤 Karaoke Grace
      </h1>

      {/* 🔥 SUBTÍTULO */}
      <p style={{
        color: "#cccccc",
        fontSize: "16px",
        position: "relative",
        zIndex: 10
      }}>
        Escolha sua música e solte a voz! 🎶
      </p>

      {/* 🔎 Buscar */}
      <button
        onClick={() => navigate("/buscar")}
        style={estiloBotao}
      >
        🔎 Buscar Música
      </button>

      {/* 🎶 Playlist */}
      <button
        onClick={() => navigate("/playlist")}
        style={estiloBotao}
      >
        🎶 Minha Playlist ({quantidade})
      </button>

      {/* 🚪 Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("logado")
          navigate("/login")
        }}
        style={{ ...estiloBotao, backgroundColor: "#444" }}
      >
        🚪 Sair
      </button>
    </div>
  )
}

const estiloBotao = {
  display: "block",
  margin: "15px auto",
  padding: "15px 30px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#ff0000",
  color: "#ffffff",
  width: "240px",
  transition: "0.2s",
  position: "relative",
  zIndex: 10 // 🔥 evita ficar atrás de camadas
}

export default Home