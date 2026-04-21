import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function Home() {
  const navigate = useNavigate()
  const [quantidade, setQuantidade] = useState(0)

  // 🔥 pegar quantidade da playlist
  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("playlist")) || []
    setQuantidade(dados.length)
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      
      <h1>🎤 Karaoke Grace</h1>
      <p style={{ color: "#aaa" }}>
        Escolha sua música e solte a voz! 🎶
      </p>

      {/* 🔎 Buscar */}
      <button
        onClick={() => navigate("/buscar")}
        style={estiloBotao}
      >
        🔎 Buscar Música
      </button>

      {/* 🎶 Playlist com contador */}
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
  color: "#fff",
  width: "240px",
  transition: "0.2s"
}

export default Home