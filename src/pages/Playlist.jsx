import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Playlist() {
  const [playlist, setPlaylist] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("playlist")) || []
    setPlaylist(dados)
  }, [])

  function tocar(musica) {
    navigate("/player", {
      state: {
        musica: musica.titulo,
        video: `https://www.youtube.com/watch?v=${musica.videoId}`
      }
    })
  }

  function remover(videoId) {
    const nova = playlist.filter(m => m.videoId !== videoId)
    setPlaylist(nova)
    localStorage.setItem("playlist", JSON.stringify(nova))
  }

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      
      <button onClick={() => navigate("/")}>⬅ Voltar</button>

      <h1>🎶 Minha Playlist</h1>

      {playlist.length === 0 && <p>Playlist vazia</p>}

      {playlist.map((m, index) => (
        <div
          key={index}
          style={{
            margin: "10px auto",
            padding: "10px",
            width: "300px",
            background: "#1c1c1c",
            borderRadius: "10px"
          }}
        >
          <p>{m.titulo}</p>

          <button onClick={() => tocar(m)}>▶️ Tocar</button>
          <button onClick={() => remover(m.videoId)}>❌ Remover</button>
        </div>
      ))}
    </div>
  )
}

export default Playlist